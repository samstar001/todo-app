import { httpError } from "../utils/httpError.js";

const PRIORITIES = ["low", "medium", "high"];

// Shortcut for a 400 Bad Request error
const badRequest = (message) => httpError(400, message);

// Check a value is a real calendar date in YYYY-MM-DD format
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

// Validate and clean the body of POST /api/todos
export function validateCreateTodo(req, res, next) {
  const { title, priority = "medium", dueDate = null } = req.body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return next(badRequest("Title is required"));
  }
  if (title.trim().length > 200) {
    return next(badRequest("Title must be 200 characters or fewer"));
  }
  if (!PRIORITIES.includes(priority)) {
    return next(badRequest("Priority must be one of: low, medium, high"));
  }
  if (dueDate !== null && !isValidDate(dueDate)) {
    return next(
      badRequest("dueDate must be a valid date (YYYY-MM-DD) or null"),
    );
  }

  req.body = { title: title.trim(), priority, dueDate };
  next();
}

// Validate the optional filters in GET /api/todos?completed=&priority=
export function validateListQuery(req, res, next) {
  const { completed, priority } = req.query;
  const filters = {};

  if (completed !== undefined) {
    if (completed !== "true" && completed !== "false") {
      return next(badRequest("completed must be 'true' or 'false'"));
    }
    filters.completed = completed === "true";
  }
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) {
      return next(badRequest("Priority must be one of: low, medium, high"));
    }
    filters.priority = priority;
  }

  req.filters = filters;
  next();
}

// Make sure :id is a positive whole number and store it as a number on the request
export function validateIdParam(req, res, next) {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return next(badRequest("id must be a positive integer"));
  }

  req.todoId = Number(id);
  next();
}

// Validate the body of PATCH /api/todos/:id (all fields optional, at least one required)
export function validateUpdateTodo(req, res, next) {
  const body = req.body ?? {};
  const changes = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return next(badRequest("Title must be a non-empty string"));
    }
    if (body.title.trim().length > 200) {
      return next(badRequest("Title must be 200 characters or fewer"));
    }
    changes.title = body.title.trim();
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return next(badRequest("completed must be true or false"));
    }
    changes.completed = body.completed;
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      return next(badRequest("Priority must be one of: low, medium, high"));
    }
    changes.priority = body.priority;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate !== null && !isValidDate(body.dueDate)) {
      return next(
        badRequest("dueDate must be a valid date (YYYY-MM-DD) or null"),
      );
    }
    changes.dueDate = body.dueDate;
  }

  if (Object.keys(changes).length === 0) {
    return next(
      badRequest(
        "Provide at least one field to update: title, completed, priority, dueDate",
      ),
    );
  }

  req.changes = changes;
  next();
}
