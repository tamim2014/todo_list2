/*
 * Garges-Les-Gonesses
 * Dimanche 07.06.20026
 *
 * 🧠 Intelligence UX: Auto‑tri
 *    🟦 les tâches cochées descendent
 *    🟦 les urgentes montent
 *    🟦 les catégories se regroupent
 *
 */



// ===============================
//  CONFIG
// ===============================

const PAGE_PREFIX = "pensebete_";
const TODO_KEY = PAGE_PREFIX + "todos";
let editIndex = null;


// ===============================
//  SON
// ===============================




function playCheckSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
}

function playUncheckSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = 604; /* trop bas on capte presque r1 si y a d'autre son sur pc mais ça va  */
    gain.gain.value = 0.10;   

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
}




// ===============================
//  UTILITAIRES
// ===============================

function timeAgo(timestamp) {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return "il y a quelques secondes";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} heures`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} jours`;
    return "il y a longtemps";
}

function getTodos() {
    const data = localStorage.getItem(TODO_KEY);
    return data ? JSON.parse(data) : [];
}


// Intelligence UX: Auto-Tri
function sortTodos(todos) {
    return todos.sort((a, b) => {

        // 1. Les urgentes montent
        if (a.category === "Urgent" && b.category !== "Urgent") return -1;
        if (b.category === "Urgent" && a.category !== "Urgent") return 1;

        // 2. Les non cochées avant les cochées
        if (!a.checked && b.checked) return -1;
        if (a.checked && !b.checked) return 1;

        // 3. Les catégories se regroupent (ordre alphabétique)
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;

        // 4. À catégorie égale → tri par date (les plus récentes en haut)
        return b.created_at - a.created_at;
    });
}







function saveTodos(todos) {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}


// ===============================
//  AJOUT / MODIFICATION
// ===============================

function addOrEdit() {
    let taskInput = document.getElementById("task");
    let categoryInput = document.getElementById("category");
    let addBtn = document.getElementById("add");

    let text = taskInput.value.trim();
    let category = categoryInput.value;

    if (text === "") {
        alert("Vous n'avez rien écrit !");
        return;
    }

    if (!category) category = "Divers";

    let todos = getTodos();

    if (editIndex !== null) {
        todos[editIndex].text = text;
        todos[editIndex].category = category;
        editIndex = null;
        addBtn.textContent = "Ajouter";
    } else {
        todos.push({
            text: text,
            category: category,
            created_at: Date.now(),
            checked: false
        });
    }

   // saveTodos(todos);
    saveTodos(sortTodos(todos));
    showTodos();

    taskInput.value = "";
    categoryInput.value = "Divers";
}


// ===============================
//  SUPPRESSION
// ===============================

function removeTodo(index) {
    const li = document.querySelectorAll("ul li")[index];

    // 1) Animation fade-out
    li.classList.add("fade-out");

    // 2) Après l’animation → suppression réelle
    setTimeout(() => {
        let todos = getTodos();
        todos.splice(index, 1);
		saveTodos(sortTodos(todos));
		showTodos();

    }, 350); // même durée que l’animation
}



// ===============================
//  MODE ÉDITION
// ===============================

function editTodo(index) {
    const todos = getTodos();
    const t = todos[index];

    document.getElementById("task").value = t.text;
    document.getElementById("category").value = t.category;

    editIndex = index;
    document.getElementById("add").textContent = "Modifier";
}


// ===============================
//  AFFICHAGE
// ===============================

function showTodos() {
    //const todos = getTodos();
	const todos = sortTodos(getTodos());

    let html = "<ul>";

    todos.forEach((t, i) => {
        const date = new Date(t.created_at);
        const formatted = date.toLocaleString();

		html += `
			<li class="${t.checked ? "checked" : ""}" onclick="toggleChecked(${i})">
				<span class="checkmark"></span>
				<span class="badge ${t.category}">${t.category}</span>
				${t.text}
				<br>
				<small class="date">
					Ajouté le ${formatted} (${timeAgo(t.created_at)})
				</small>

				<button class="edit" onclick="event.stopPropagation(); editTodo(${i})">✏️</button>
				<button class="remove" onclick="event.stopPropagation(); removeTodo(${i})">❌</button>
			</li>
		`;

    });

    html += "</ul>";
    document.getElementById("todos").innerHTML = html;
}


// ===============================
//  CHECKED PERSISTANT
// ===============================

function toggleChecked(index) {
    let todos = getTodos();
    const wasChecked = todos[index].checked;

    todos[index].checked = !todos[index].checked;
    //saveTodos(todos);
	saveTodos(sortTodos(todos));

    showTodos();

    const li = document.querySelectorAll("ul li")[index];

    // Si on coche → POUF + DONE + SON
    if (!wasChecked) {
        // Son discret
        playCheckSound();

        // Effet POUF
        li.classList.add("pouf");
        setTimeout(() => li.classList.remove("pouf"), 280);

        // Effet DONE (halo vert)
        setTimeout(() => {
            li.classList.add("done-glow");
            setTimeout(() => li.classList.remove("done-glow"), 600);
        }, 280);
    }

    // Si on décoche → slide-left + SON discret
    if (wasChecked) {
        playUncheckSound();

        li.classList.add("unchecked-slide");
        setTimeout(() => li.classList.remove("unchecked-slide"), 250);
    }
}







// ===============================
//  INIT
// ===============================

document.getElementById("add").addEventListener("click", addOrEdit);
showTodos();

// ===========================================================
//  Footer notes: Repliable (comme un panneau d’admin)
// ===========================================================


function toggleNotes() {
    document.getElementById("notes").classList.toggle("open");
}
