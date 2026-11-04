// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

// Highlight the current section in the navigation
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".main-nav a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach((section) => sectionObserver.observe(section));

// Study planner — tasks are stored locally in this browser
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedButton = document.getElementById("clearCompleted");
const STORAGE_KEY = "mayowaPortfolioTasks";
let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The planner remains usable for the current page even if storage is unavailable.
  }
}

function renderTasks() {
  taskList.replaceChildren();
  const completedCount = tasks.filter((task) => task.completed).length;
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} · ${completedCount} completed`;

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Your study planner is ready. Add your first task above.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: `${Date.now()}-${Math.random()}`, text, completed: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();

// Contact form validation. The form prepares a message in the visitor's email app.
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("number").value.trim();
  const message = document.getElementById("message").value.trim();

  const errors = {
    name: name ? "" : "Please enter your name.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email address.",
    message: message ? "" : "Please write a short message."
  };

  document.getElementById("nameError").textContent = errors.name;
  document.getElementById("emailError").textContent = errors.email;
  document.getElementById("messageError").textContent = errors.message;

  if (Object.values(errors).some(Boolean)) {
    formNote.textContent = "Please correct the highlighted fields.";
    return;
  }

  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`);
  formNote.textContent = "Opening your email app to prepare the message…";
  window.location.href = `mailto:ogunremimayowa@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById("year").textContent = new Date().getFullYear();
