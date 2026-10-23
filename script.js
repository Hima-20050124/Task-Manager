
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const clearCompletedButton = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("todoTasks")
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        text: text,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "list-group-item task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";

        if (task.completed) {
            text.classList.add("completed");
        }

        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-sm btn-outline-danger delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.text);

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });

    // Update task counts
    totalCount.textContent = tasks.length;

    activeCount.textContent = tasks.filter(
        task => !task.completed
    ).length;

    completedCount.textContent = tasks.filter(
        task => task.completed
    ).length;

    // Show message when the filtered list is empty
    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    if (tasks.length === 0) {
        emptyMessage.textContent =
            "No tasks yet. Add your first task!";
    } else if (filteredTasks.length === 0) {
        emptyMessage.textContent =
            "No tasks match this filter.";
    }

    // Update active filter button
    filterButtons.forEach(button => {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("btn-primary", isActive);
        button.classList.toggle("btn-outline-primary", !isActive);
    });

    clearCompletedButton.disabled =
        !tasks.some(task => task.completed);
}

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

// Delete all completed tasks
clearCompletedButton.addEventListener("click", function () {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// Initial display
renderTasks();
