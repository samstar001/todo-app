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
