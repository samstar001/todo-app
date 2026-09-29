import { Router } from "express";
import {
  createTodo,
  listTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todos.controller.js";
import {
  validateCreateTodo,
  validateListQuery,
  validateIdParam,
  validateUpdateTodo,
} from "../middleware/validate.js";

const router = Router();

// GET /api/todos - list todos (validates query filters first)
router.get("/", validateListQuery, listTodos);

// POST /api/todos - create a todo (validates body first)
router.post("/", validateCreateTodo, createTodo);

// GET /api/todos/:id - fetch one todo
router.get("/:id", validateIdParam, getTodo);

// PATCH /api/todos/:id - partially update a todo
router.patch("/:id", validateIdParam, validateUpdateTodo, updateTodo);

// DELETE /api/todos/:id - permanently delete a todo
router.delete("/:id", validateIdParam, deleteTodo);

export default router;
