import * as todosService from "../services/todos.service.js";
import { httpError } from "../utils/httpError.js";

// POST /api/todos - create a todo and return it with 201
export function createTodo(req, res) {
  const todo = todosService.createTodo(req.body);
  res.status(201).json(todo);
}

// GET /api/todos - return all todos, applying any validated filters
export function listTodos(req, res) {
  const todos = todosService.getAllTodos(req.filters);
  res.status(200).json(todos);
}

// GET /api/todos/:id - return one todo or 404
export function getTodo(req, res) {
  const todo = todosService.getTodoById(req.todoId);
  if (!todo) throw httpError(404, "Todo not found");
  res.status(200).json(todo);
}

// PATCH /api/todos/:id - apply partial changes and return the updated todo
export function updateTodo(req, res) {
  const todo = todosService.updateTodo(req.todoId, req.changes);
  if (!todo) throw httpError(404, "Todo not found");
  res.status(200).json(todo);
}

// DELETE /api/todos/:id - remove a todo and confirm which one was deleted
export function deleteTodo(req, res) {
  const deleted = todosService.deleteTodo(req.todoId);
  if (!deleted) throw httpError(404, "Todo not found");

  res.status(200).json({
    message: `Todo "${deleted.title}" deleted`,
    todo: deleted,
  });
}
