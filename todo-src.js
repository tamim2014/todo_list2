const STORAGE_KEY = "todo_pensebete"; // <<< clé unique

function get_todos() {
    var todos = [];
    var todos_str = localStorage.getItem(STORAGE_KEY);
    if (todos_str !== null) {
        todos = JSON.parse(todos_str);
    }
    return todos;
}

function add() {
    var task = document.getElementById('task').value;

    var todos = get_todos();
    todos.push(task);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));

    show();

    if (task === '') { alert("Vous n'avez rien écrit!"); }
    document.getElementById("task").value = "";

    return false;
}

function remove() {
    var id = this.getAttribute('id');
    var todos = get_todos();
    todos.splice(id, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));

    show();
    return false;
}

function show() {
    var todos = get_todos();

    var html = '<ul>';
    for (var i = 0; i < todos.length; i++) {
        html += '<li class="fait">' + todos[i] + 
                '<button class="remove" id="' + i + '">x</button></li>';
    }
    html += '</ul>';

    document.getElementById('todos').innerHTML = html;

    var buttons = document.getElementsByClassName('remove');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', remove);
    }
}

document.getElementById('add').addEventListener('click', add);
show();
