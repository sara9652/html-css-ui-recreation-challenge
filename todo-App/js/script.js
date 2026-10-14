
"use strict";

// ----------------------------------
// 1. Select HTML elements
// ----------------------------------

const addTaskBtn = document.getElementById("add-task-btn");
const addTaskSection = document.getElementById("add-task-section");
const cancelTaskBtn = document.getElementById("cancel-task-btn");

const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");

const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const taskSummary = document.getElementById("task-summary");

const searchInput = document.getElementById("search-input");

const allCount = document.getElementById("all-count");
const todayCount = document.getElementById("today-count");
const importantCount = document.getElementById("important-count");
const completedCount = document.getElementById("completed-count");

const progressCircle = document.getElementById("progress-circle");
const progressPercent = document.getElementById("progress-percent");
const completedSummary = document.getElementById("completed-summary");

const pageHeading = document.querySelector(".page-heading h1");

// ----------------------------------
// 2. App state
// ----------------------------------

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("taskpro-tasks")
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string"
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

let currentFilter = "all";
let editingTaskId = null;

// ----------------------------------
// 3. Helper functions
// ----------------------------------

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function saveTasks() {
    try {
        localStorage.setItem("taskpro-tasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Tasks could not be saved in this browser.");
    }
}

function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function createElement(tag, className, text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

// ----------------------------------
// 4. Open and close the form
// ----------------------------------

function openTaskForm() {
    editingTaskId = null;

    taskForm.reset();

    addTaskSection.querySelector("h2").textContent = "Add a New Task";
    taskForm.querySelector(".save-task-btn").textContent = "Save Task";

    addTaskSection.hidden = false;
    taskTitle.focus();
}

function closeTaskForm() {
    addTaskSection.hidden = true;
    taskForm.reset();
    editingTaskId = null;

    addTaskSection.querySelector("h2").textContent = "Add a New Task";
    taskForm.querySelector(".save-task-btn").textContent = "Save Task";
}

addTaskBtn.addEventListener("click", openTaskForm);
cancelTaskBtn.addEventListener("click", closeTaskForm);

// ----------------------------------
// 5. Add and edit tasks
// ----------------------------------

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const titleText = taskTitle.value.trim();
    const priorityText = taskPriority.value;
    const dateText = taskDate.value;

    if (!titleText) {
        alert("Please enter a task.");
        taskTitle.focus();
        return;
    }

    if (!["low", "medium", "high"].includes(priorityText)) {
        alert("Please select a valid priority.");
        return;
    }

    if (dateText && dateText < getTodayDate()) {
        alert("Due date cannot be in the past.");
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (task) {
            task.title = titleText;
            task.priority = priorityText;
            task.date = dateText;
        }
    } else {
        const newTask = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            title: titleText,
            priority: priorityText,
            date: dateText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
    }

    saveTasks();
    renderTasks();
    closeTaskForm();
});

// ----------------------------------
// 6. Create a task card
// ----------------------------------

function createTaskCard(task) {
    const taskCard = createElement("article", "task-card");

    if (task.completed) {
        taskCard.classList.add("completed");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.title} as completed`
    );

    checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;

        saveTasks();
        renderTasks();
    });
    
    const taskDetails = createElement("div", "task-details");

    const titleHeading = createElement("h3", "", task.title);

    taskDetails.appendChild(titleHeading);

    const priorityBadge = createElement(
        "span",
        `priority ${task.priority}`,
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    );

    const dateLabel = createElement("span", "task-date");

    const dateIcon = document.createElement("i");
    dateIcon.className = "fa-regular fa-calendar";
    dateIcon.setAttribute("aria-hidden", "true");

    dateLabel.appendChild(dateIcon);
    dateLabel.appendChild(
        document.createTextNode(` ${formatDate(task.date)}`)
    );

    const taskActions = createElement("div", "task-actions");

    const editButton = createElement("button", "edit-task-btn");
    editButton.type = "button";
    editButton.setAttribute("aria-label", `Edit ${task.title}`);

    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-pen";
    editIcon.setAttribute("aria-hidden", "true");

    editButton.appendChild(editIcon);

    editButton.addEventListener("click", function () {
        editingTaskId = task.id;
        
        taskTitle.value = task.title;
        taskPriority.value = task.priority;
        taskDate.value = task.date || "";

        addTaskSection.querySelector("h2").textContent = "Edit Task";
        taskForm.querySelector(".save-task-btn").textContent = "Update Task";
        
        addTaskSection.hidden = false;
        taskTitle.focus();

    });
    
    const deleteButton = createElement("button", "delete-task-btn");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can";
    deleteIcon.setAttribute("aria-hidden", "true");

    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener("click", function () {
        const confirmed = confirm(`Delete "${task.title}"?`);
        
        if (!confirmed) {
            return;
        }
        
        tasks = tasks.filter(item => item.id !== task.id);
        
        saveTasks();
        renderTasks();
    });
    
    taskActions.append(editButton, deleteButton);
    
    taskCard.append(
        checkbox,
        taskDetails,
        priorityBadge,
        dateLabel,
        taskActions
    );

    return taskCard;
}

// ----------------------------------
// 7. Filter tasks
// ----------------------------------

function matchesFilter(task) {
    switch (currentFilter) {
        case "today":
            return task.date === getTodayDate();

        case "important":
            return task.priority === "high";

        case "completed":
            return task.completed;

        case "all":
        default:
            return true;
    }
}

function getVisibleTasks() {
    const searchText = searchInput.value.trim().toLowerCase();

    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchText);

        return matchesSearch && matchesFilter(task);
    });
}

// ----------------------------------
// 8. Update counts and progress
// ----------------------------------

function updateDashboard() {
    const today = getTodayDate();

    const todayTasks = tasks.filter(task => task.date === today);
    const importantTasks = tasks.filter(task => task.priority === "high");
    const completedTasks = tasks.filter(task => task.completed);

    allCount.textContent = tasks.length;
    todayCount.textContent = todayTasks.length;
    importantCount.textContent = importantTasks.length;
    completedCount.textContent = completedTasks.length;

    const completedToday = todayTasks.filter(task => task.completed).length;
    const totalToday = todayTasks.length;

    const percentage = totalToday === 0
        ? 0
        : Math.round((completedToday / totalToday) * 100);

    progressPercent.textContent = `${percentage}%`;
    completedSummary.textContent = `${completedToday} / ${totalToday}`;

    if (progressCircle) {
        progressCircle.style.background =
            `conic-gradient(#4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
    }

    taskSummary.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} total`;
}

// ----------------------------------
// 9. Render tasks
// ----------------------------------

function renderTasks() {
    const visibleTasks = getVisibleTasks();

    taskList.replaceChildren();

    visibleTasks.forEach(task => {
        taskList.appendChild(createTaskCard(task));
    });

    emptyMessage.hidden = tasks.length !== 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = "No tasks match your search or filter.";
        emptyMessage.hidden = false;
    }

    updateDashboard();
}

// ----------------------------------
// 10. Filter button events
// ----------------------------------

const filterButtons = document.querySelectorAll("[data-filter]");

filterButtons.forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        currentFilter = button.dataset.filter;

        if (pageHeading) {
            const headings = {
                all: "All Tasks",
                today: "Today's Tasks",
                important: "Important Tasks",
                completed: "Completed Tasks"
            };

            pageHeading.textContent = headings[currentFilter] || "All Tasks";
        }

        document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.filter === currentFilter
            );
        });

        renderTasks();
    });
});

// ----------------------------------
// 11. Search tasks
// ----------------------------------

searchInput.addEventListener("input", renderTasks);

// ----------------------------------
// 12. Initial render
// ----------------------------------

renderTasks();
