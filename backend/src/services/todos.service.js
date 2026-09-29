import db from "../db/database.js";

// Convert a database row (snake_case, 0/1) into the API shape (camelCase, boolean)
function toTodo(row) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Prepared statements are compiled once and reused on every call
const insertTodo = db.prepare(
  "INSERT INTO todos (title, priority, due_date) VALUES (@title, @priority, @dueDate)",
);
const selectTodoById = db.prepare("SELECT * FROM todos WHERE id = ?");

// Insert a todo and return the saved record
export function createTodo({ title, priority, dueDate }) {
  const result = insertTodo.run({ title, priority, dueDate });
  return toTodo(selectTodoById.get(result.lastInsertRowid));
}

// Return todos (newest first), optionally filtered by completed and/or priority
export function getAllTodos({ completed, priority } = {}) {
  const conditions = [];
  const params = {};

  if (completed !== undefined) {
    conditions.push("completed = @completed");
    params.completed = completed ? 1 : 0;
  }
  if (priority !== undefined) {
    conditions.push("priority = @priority");
    params.priority = priority;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM todos ${where} ORDER BY created_at DESC, id DESC`;

  return db.prepare(sql).all(params).map(toTodo);
}

// Prepared statement for deleting by id
const deleteTodoById = db.prepare("DELETE FROM todos WHERE id = ?");

// Find one todo by id, or return null if it doesn't exist
export function getTodoById(id) {
  const row = selectTodoById.get(id);
  return row ? toTodo(row) : null;
}

// Update only the provided fields; return the updated todo, or null if not found
export function updateTodo(id, changes) {
  if (!selectTodoById.get(id)) return null;

  const fields = [];
  const params = { id };

  if (changes.title !== undefined) {
    fields.push("title = @title");
    params.title = changes.title;
  }
  if (changes.completed !== undefined) {
    fields.push("completed = @completed");
    params.completed = changes.completed ? 1 : 0;
  }
  if (changes.priority !== undefined) {
    fields.push("priority = @priority");
    params.priority = changes.priority;
  }
  if (changes.dueDate !== undefined) {
    fields.push("due_date = @dueDate");
    params.dueDate = changes.dueDate;
  }

  // Always refresh the modification time
  fields.push("updated_at = datetime('now')");

  db.prepare(`UPDATE todos SET ${fields.join(", ")} WHERE id = @id`).run(
    params,
  );
  return toTodo(selectTodoById.get(id));
}

// Delete a todo; return the deleted todo, or null if it didn't exist
export function deleteTodo(id) {
  const todo = getTodoById(id);
  if (!todo) return null;

  deleteTodoById.run(id);
  return todo;
}
