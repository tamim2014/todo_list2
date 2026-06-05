
const PAGE_PREFIX = "pensebete_";

// ===============================
//  CONFIG
// ===============================
const TODO_KEY = PAGE_PREFIX + "todos"; 
let editIndex = null; // Pour le mode édition

// ===============================
//  UTILITAIRES
// ===============================

// Convertit un timestamp en "il y a X minutes"
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000); // en secondes

    if (diff < 60) return "il y a quelques secondes";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} heures`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} jours`;
    return "il y a longtemps";
}

// Récupère les tâches
function getTodos() {
    const data = localStorage.getItem(TODO_KEY);
    return data ? JSON.parse(data) : [];
}

// Sauvegarde
function saveTodos(todos) {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

// ===============================
//  AJOUT / MODIFICATION
// ===============================
function addOrEdit() {
    console.clear();
    console.log("=== DEBUG addOrEdit() ===");

    let taskInput = document.getElementById("task");
    let categoryInput = document.getElementById("category");
    let addBtn = document.getElementById("add");

    console.log("taskInput =", taskInput);
    console.log("categoryInput =", categoryInput);
    console.log("addBtn =", addBtn);

    if (!taskInput) {
        console.error("❌ ERREUR : #task introuvable dans le DOM");
        return;
    }
    if (!categoryInput) {
        console.error("❌ ERREUR : #category introuvable dans le DOM");
        return;
    }

    let text = taskInput.value.trim();
    let category = categoryInput.value;

    console.log("text =", text);
    console.log("category =", category);
    console.log("editIndex =", editIndex);

    if (text === "") {
        alert("Vous n'avez rien écrit !");
        return;
    }

    if (!category) {
        console.warn("⚠️ Catégorie vide → forcée à Divers");
        category = "Divers";
    }

    let todos = getTodos();
    console.log("todos avant =", todos);

    if (editIndex !== null) {
        console.log("MODE EDITION");
        todos[editIndex].text = text;
        todos[editIndex].category = category;
        editIndex = null;
        addBtn.textContent = "Ajouter";
    } else {
        console.log("MODE AJOUT");
        todos.push({
            text: text,
            category: category,
            created_at: Date.now()
        });
    }

    console.log("todos après =", todos);

    saveTodos(todos);
    showTodos();

    taskInput.value = "";
    categoryInput.value = "Divers";

    console.log("=== FIN DEBUG ===");
}



// ===============================
//  SUPPRESSION
// ===============================
function removeTodo(index) {
    let todos = getTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    showTodos();
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
    const todos = getTodos();
    let html = "<ul>";

    todos.forEach((t, i) => {
        const date = new Date(t.created_at);
        const formatted = date.toLocaleString();

        html += `
            <li>
                <span class="badge ${t.category}">${t.category}</span>
                ${t.text}
                <br>
                <small class="date">
                    Ajouté le ${formatted} (${timeAgo(t.created_at)})
                </small>

                <button class="edit" onclick="editTodo(${i})">✏️</button>
                <button class="remove" onclick="removeTodo(${i})">❌</button>
            </li>
        `;
    });

    html += "</ul>";
    document.getElementById("todos").innerHTML = html;
}

// ===============================
//  INIT
// ===============================
document.getElementById("add").addEventListener("click", addOrEdit);
showTodos();
