import * as api from "./api.js";
import * as ui from "./ui.js";

// Elements we attach events to
const form = document.getElementById("add-form");
const list = document.getElementById("todo-list");
const statusTabs = document.querySelector(".filters__tabs");
const priorityFilter = document.getElementById("priority-filter");

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
  ui.showLoading(true);
  ui.showListError(null);

  try {
    const todos = await api.fetchTodos(buildFilters());
    ui.renderTodos(todos);
  } catch (error) {
    ui.showListError(error.message);
  } finally {
    ui.showLoading(false);
  }
}

// Add a todo when the form is submitted
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.showFormError(null);

  try {
    await api.createTodo(ui.getFormValues());
    ui.resetForm();
    await loadTodos();
  } catch (error) {
    ui.showFormError(error.message);
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

// Delete a todo when its Delete button is clicked
list.addEventListener("click", async (event) => {
  const button = event.target.closest(".todo__delete");
  if (!button) return;

  try {
    const result = await api.deleteTodo(getTodoId(button));
    ui.showToast(result.message);
    await loadTodos();
  } catch (error) {
    ui.showListError(error.message);
  }
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
