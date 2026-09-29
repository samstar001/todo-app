import * as todosService from "../services/todos.service.js";

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
