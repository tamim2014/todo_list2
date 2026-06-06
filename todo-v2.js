// ===============================
//  CONFIG
// ===============================

const PAGE_PREFIX = "pensebete_";
const TODO_KEY = PAGE_PREFIX + "todos";
let editIndex = null;


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

    saveTodos(todos);
    showTodos();

    taskInput.value = "";
    categoryInput.value = "Divers";
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
            <li class="${t.checked ? "checked" : ""}" onclick="toggleChecked(${i})">
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
    todos[index].checked = !todos[index].checked;
    saveTodos(todos);
    showTodos();
}


// ===============================
//  INIT
// ===============================

document.getElementById("add").addEventListener("click", addOrEdit);
showTodos();
