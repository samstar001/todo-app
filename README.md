# Todo App

A full-stack todo list built with Node.js, Express, SQLite, and a vanilla HTML/CSS/JavaScript frontend. Express serves both the API and the frontend, so the whole app runs as one service.

**Live app:** _added after deployment_

## Features

- Add, list, edit, complete, and delete todos
- Priority (low, medium, high) and optional due date
- Filter by completed status and priority

## Tech stack

- Backend: Node.js, Express, better-sqlite3 (SQLite)
- Frontend: HTML, CSS, JavaScript (no framework)

## Run locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

## Environment variables

| Variable    | Default         | Purpose                                  |
| ----------- | --------------- | ---------------------------------------- |
| PORT        | 3000            | Port the server listens on               |
| DB_PATH     | ./data/todos.db | Location of the SQLite file              |
| CORS_ORIGIN | \*              | Allowed origin for cross-origin requests |

## API

Base path: `/api`

| Method | Endpoint       | Body                                                                | Success                  |
| ------ | -------------- | ------------------------------------------------------------------- | ------------------------ |
| GET    | /api/health    | none                                                                | 200                      |
| GET    | /api/todos     | none (optional `?completed=true\|false&priority=low\|medium\|high`) | 200, array               |
| GET    | /api/todos/:id | none                                                                | 200, todo                |
| POST   | /api/todos     | `{ title, priority?, dueDate? }`                                    | 201, todo                |
| PATCH  | /api/todos/:id | any of `{ title, completed, priority, dueDate }`                    | 200, todo                |
| DELETE | /api/todos/:id | none                                                                | 200, `{ message, todo }` |

### Todo object

```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-10-05",
  "createdAt": "2026-09-29 10:00:00",
  "updatedAt": "2026-09-29 10:00:00"
}
```

### Validation rules

- `title`: required string, 1 to 200 characters after trimming
- `priority`: `low`, `medium` (default), or `high`
- `dueDate`: `YYYY-MM-DD` or `null`
- `completed`: boolean

### Errors

All errors use one shape:

```json
{ "error": { "message": "Title is required", "status": 400 } }
```

Status codes used: 400 (invalid input), 404 (not found), 500 (server error).

## Note on data persistence

The app uses a SQLite file. On free hosting tiers the disk is ephemeral, so data may reset when the service restarts or redeploys.
