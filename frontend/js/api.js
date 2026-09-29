import { API_BASE_URL } from "./config.js";

// Send a request and return the parsed JSON, or throw an Error with a readable message
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and try again.",
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Something went wrong. Please try again.",
    );
  }

  return data;
}

// GET /api/todos with optional filters
export function fetchTodos({ completed, priority } = {}) {
  const params = new URLSearchParams();
  if (completed !== undefined) params.set("completed", completed);
  if (priority) params.set("priority", priority);

  const query = params.toString();
  return request(`/todos${query ? `?${query}` : ""}`);
}

// POST /api/todos
export function createTodo(todo) {
  return request("/todos", { method: "POST", body: JSON.stringify(todo) });
}

// PATCH /api/todos/:id
export function updateTodo(id, changes) {
  return request(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

// DELETE /api/todos/:id
export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: "DELETE" });
}
