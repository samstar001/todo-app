const PRIORITIES = ["low", "medium", "high"];

// Build an error carrying a 400 status so errorHandler can format it
function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

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
