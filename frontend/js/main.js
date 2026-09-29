import * as api from "./api.js";
import * as ui from "./ui.js";

// Elements we attach events to
const form = document.getElementById("add-form");
const list = document.getElementById("todo-list");
const statusTabs = document.querySelector(".filters__tabs");
const priorityFilter = document.getElementById("priority-filter");
const retryButton = document.getElementById("retry-btn");
let hasLoadedOnce = false;

// Current filter selection
const state = { status: "all", priority: "" };

// Convert the filter selection into API query filters
function buildFilters() {
  const filters = {};
  if (state.status === "active") filters.completed = false;
  if (state.status === "completed") filters.completed = true;
  if (state.priority) filters.priority = state.priority;
  return filters;
}

// Get the todo id from the row that contains the given element
function getTodoId(element) {
  return Number(element.closest(".todo").dataset.id);
}

// Fetch todos from the API and draw them
async function loadTodos() {
  ui.showListError(null);

  // Show the loading message only on the first load to avoid flicker
  let slowTimer;
  if (!hasLoadedOnce) {
    ui.showLoading(true);
    slowTimer = setTimeout(() => {
      ui.setLoadingText(
        "Waking up the server… this can take up to a minute on free hosting.",
      );
    }, 4000);
  }

  try {
    const todos = await api.fetchTodos(buildFilters());
    ui.renderTodos(todos);
    hasLoadedOnce = true;
  } catch (error) {
    ui.showListError(error.message);
  } finally {
    clearTimeout(slowTimer);
    ui.showLoading(false);
  }
}

// Retry loading after an error
retryButton.addEventListener("click", loadTodos);

// Add a todo when the form is submitted
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.showFormError(null);
  ui.setFormBusy(true);

  try {
    await api.createTodo(ui.getFormValues());
    ui.resetForm();
    ui.showToast("Task added");
    await loadTodos();
  } catch (error) {
    ui.showFormError(error.message);
  } finally {
    ui.setFormBusy(false);
  }
});

// Toggle completed when a checkbox changes
list.addEventListener("change", async (event) => {
  if (!event.target.matches(".todo__check")) return;

  try {
    await api.updateTodo(getTodoId(event.target), {
      completed: event.target.checked,
    });
    await loadTodos();
  } catch (error) {
    event.target.checked = !event.target.checked;
    ui.showListError(error.message);
  }
});

// Save the edited title of a row
async function saveEdit(item) {
  const newTitle = ui.getEditedTitle(item).trim();
  const oldTitle = item.querySelector(".todo__title").textContent;

  // Nothing changed, so leave edit mode without calling the API
  if (newTitle === oldTitle) {
    ui.stopEditing(item);
    return;
  }

  ui.showListError(null);

  try {
    await api.updateTodo(getTodoId(item), { title: newTitle });
    ui.showToast("Todo updated");
    await loadTodos();
  } catch (error) {
    ui.showListError(error.message);
  }
}

// Delete a todo and confirm which one was removed
async function removeTodo(item) {
  try {
    const result = await api.deleteTodo(getTodoId(item));
    ui.showToast(result.message);
    await loadTodos();
  } catch (error) {
    ui.showListError(error.message);
  }
}

// Handle all button clicks inside the list (edit, cancel, save, delete)
list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo");
  if (!item) return;

  if (event.target.closest(".todo__edit")) ui.startEditing(item);
  else if (event.target.closest(".todo__cancel")) ui.stopEditing(item);
  else if (event.target.closest(".todo__save")) saveEdit(item);
  else if (event.target.closest(".todo__delete")) removeTodo(item);
});

// Keyboard shortcuts in the edit input: Enter saves, Escape cancels
list.addEventListener("keydown", (event) => {
  if (!event.target.matches(".todo__edit-input")) return;

  const item = event.target.closest(".todo");
  if (event.key === "Enter") saveEdit(item);
  if (event.key === "Escape") ui.stopEditing(item);
});

// Switch the status filter (All / Active / Completed)
statusTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;

  state.status = tab.dataset.filter;
  ui.setActiveTab(state.status);
  loadTodos();
});

// Switch the priority filter
priorityFilter.addEventListener("change", () => {
  state.priority = priorityFilter.value;
  loadTodos();
});

// Load the list when the page opens
loadTodos();
