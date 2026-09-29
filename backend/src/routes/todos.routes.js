import { Router } from "express";
import { createTodo, listTodos } from "../controllers/todos.controller.js";
import {
  validateCreateTodo,
  validateListQuery,
} from "../middleware/validate.js";

const router = Router();

// GET /api/todos - list todos (validates query filters first)
router.get("/", validateListQuery, listTodos);

// POST /api/todos - create a todo (validates body first)
router.post("/", validateCreateTodo, createTodo);

export default router;
