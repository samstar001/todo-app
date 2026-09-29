// Elements the UI updates
const form = document.getElementById("add-form");
const titleInput = document.getElementById("title-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-template");
const loading = document.getElementById("loading");
const listError = document.getElementById("list-error");
const emptyState = document.getElementById("empty-state");
const formError = document.getElementById("form-error");
const toast = document.getElementById("toast");
const tabs = document.querySelectorAll(".tab");

// Uppercase the first letter, e.g. "high" -> "High"
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Today's date as YYYY-MM-DD in the user's local time zone
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Turn "2026-10-05" into "Oct 5, 2026"
function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build one todo row from the template
function createTodoElement(todo) {
  const item = template.content.firstElementChild.cloneNode(true);
  item.dataset.id = todo.id;
  item.classList.toggle("todo--completed", todo.completed);

  const check = item.querySelector(".todo__check");
  check.checked = todo.completed;
  check.setAttribute(
    "aria-label",
    todo.completed ? "Mark as not completed" : "Mark as completed",
  );

  item.querySelector(".todo__title").textContent = todo.title;

  const badge = item.querySelector(".badge");
  badge.classList.add(`badge--${todo.priority}`);
  badge.textContent = capitalize(todo.priority);

  const due = item.querySelector(".todo__due");
  if (todo.dueDate) {
    due.hidden = false;
    due.textContent = `Due ${formatDate(todo.dueDate)}`;
    due.classList.toggle(
      "todo__due--overdue",
      !todo.completed && todo.dueDate < todayString(),
    );
  }

  return item;
}

// Replace the list contents with the given todos (or show the empty state)
export function renderTodos(todos) {
  list.replaceChildren(...todos.map(createTodoElement));
  emptyState.hidden = todos.length > 0;
}

// Show or hide the loading message
export function showLoading(isLoading) {
  loading.hidden = !isLoading;
  if (isLoading) emptyState.hidden = true;
}

// Show an error above the list, or hide it when message is null
export function showListError(message) {
  listError.textContent = message ?? "";
  listError.hidden = !message;
}

// Show an error under the add form, or hide it when message is null
export function showFormError(message) {
  formError.textContent = message ?? "";
  formError.hidden = !message;
}

// Show a temporary popup message for 3 seconds
let toastTimer;
export function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// Highlight the active status tab
export function setActiveTab(filter) {
  tabs.forEach((tab) => {
    tab.classList.toggle("tab--active", tab.dataset.filter === filter);
  });
}

// Read the add-form fields as an object matching the API body
export function getFormValues() {
  const data = new FormData(form);
  return {
    title: data.get("title"),
    priority: data.get("priority"),
    dueDate: data.get("dueDate") || null,
  };
}

// Clear the add form and put the cursor back in the title field
export function resetForm() {
  form.reset();
  titleInput.focus();
}

// Show Save/Cancel instead of Edit/Delete (or the reverse) for one row
function toggleEditButtons(item, isEditing) {
  item.classList.toggle("todo--editing", isEditing);
  item.querySelector(".todo__edit").hidden = isEditing;
  item.querySelector(".todo__delete").hidden = isEditing;
  item.querySelector(".todo__save").hidden = !isEditing;
  item.querySelector(".todo__cancel").hidden = !isEditing;
}

// Switch a row into edit mode: hide the title and show an input with its text
export function startEditing(item) {
  if (item.classList.contains("todo--editing")) return;

  const title = item.querySelector(".todo__title");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo__edit-input";
  input.maxLength = 200;
  input.value = title.textContent;
  input.setAttribute("aria-label", "Edit task title");

  title.hidden = true;
  title.after(input);
  toggleEditButtons(item, true);

  input.focus();
  input.select();
}

// Leave edit mode and restore the original title
export function stopEditing(item) {
  item.querySelector(".todo__edit-input")?.remove();
  item.querySelector(".todo__title").hidden = false;
  toggleEditButtons(item, false);
}

// Read what the user typed in the edit input
export function getEditedTitle(item) {
  return item.querySelector(".todo__edit-input").value;
}
