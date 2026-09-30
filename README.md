# Todo App

A full-stack todo list built with **Node.js**, **Express**, **SQLite**, and a **vanilla HTML/CSS/JavaScript** frontend. A single Express service serves both the REST API and the frontend, so the whole app runs from one URL.

**Live app:** https://todo-app-gbyj.onrender.com

> **Note:** The app is hosted on Render's free tier. After about 15 minutes of inactivity the service goes to sleep, so the first request can take up to a minute to respond. The SQLite file lives on an ephemeral disk, so saved todos are cleared whenever the service restarts, redeploys, or wakes from sleep.

## Features

- Add, list, edit, complete, and delete todos
- Priority levels (`low`, `medium`, `high`)
- Optional due dates, with overdue dates highlighted
- Filter by status (All / Active / Completed) and by priority
- Inline title editing (Enter to save, Escape to cancel)
- Loading, empty, and error states, with a retry button
- Server-side validation with a consistent error format

## Tech stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Backend     | Node.js (ES modules), Express        |
| Database    | SQLite via `better-sqlite3`          |
| Frontend    | HTML, CSS, JavaScript (no framework) |
| Hosting     | Render (single Web Service)          |
| API testing | Postman                              |

## How it fits together

```
Browser ──fetch() JSON──► Express ──► SQLite file
   ▲                         │
   └──── static files ◄──────┘   (Express also serves /frontend)
```

- The frontend calls the API with relative URLs (`/api/todos`), so there is no CORS setup needed in production.
- The backend follows a layered structure: **routes → validation → controller → service → database**.
- After every change (add, update, delete), the frontend re-fetches the list so the screen always reflects what is in the database.

## Project structure

```
todo-app/
├── README.md
├── docs/
│   └── todo-api.postman_collection.json
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── data/                      # SQLite file is created here at runtime
│   └── src/
│       ├── server.js              # starts the server, handles shutdown
│       ├── app.js                 # middleware, routes, static frontend
│       ├── config/env.js          # reads environment variables
│       ├── db/
│       │   ├── database.js        # opens SQLite and runs the schema
│       │   └── schema.sql         # table definition
│       ├── routes/todos.routes.js
│       ├── controllers/todos.controller.js
│       ├── services/todos.service.js
│       ├── middleware/
│       │   ├── validate.js        # request validation
│       │   └── errorHandler.js    # standard error responses
│       └── utils/httpError.js
└── frontend/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── config.js              # API base URL
        ├── api.js                 # all fetch calls
        ├── ui.js                  # DOM rendering
        └── main.js                # events and app flow
```

## Run locally

Requirements: Node.js (LTS) and npm.

```bash
git clone https://github.com/samstar001/todo-app
cd todo-app/backend
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:3000. The database file is created automatically at `backend/data/todos.db`.

Other scripts:

| Command       | What it does                                  |
| ------------- | --------------------------------------------- |
| `npm run dev` | Starts the server with auto-restart (nodemon) |
| `npm start`   | Starts the server for production              |

## Environment variables

| Variable      | Default           | Purpose                                                     |
| ------------- | ----------------- | ----------------------------------------------------------- |
| `PORT`        | `3000`            | Port the server listens on (Render sets this automatically) |
| `DB_PATH`     | `./data/todos.db` | Location of the SQLite file, relative to `backend/`         |
| `CORS_ORIGIN` | `*`               | Allowed origin for cross-origin requests                    |

## API reference

Base URL: `https://todo-app-gbyj.onrender.com/api` (or `http://localhost:3000/api` locally)

| Method | Endpoint     | Body                                             | Success response                          |
| ------ | ------------ | ------------------------------------------------ | ----------------------------------------- |
| GET    | `/health`    | none                                             | `200` status and database connection info |
| GET    | `/todos`     | none (optional query: `completed`, `priority`)   | `200` array of todos                      |
| GET    | `/todos/:id` | none                                             | `200` todo                                |
| POST   | `/todos`     | `{ title, priority?, dueDate? }`                 | `201` created todo                        |
| PATCH  | `/todos/:id` | any of `{ title, completed, priority, dueDate }` | `200` updated todo                        |
| DELETE | `/todos/:id` | none                                             | `200` `{ message, todo }`                 |

### Todo object

```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-10-05",
  "createdAt": "2026-09-30 10:00:00",
  "updatedAt": "2026-09-30 10:00:00"
}
```

### Query filters

`GET /api/todos?completed=false&priority=high`

- `completed`: `true` or `false`
- `priority`: `low`, `medium`, or `high`
- Results are ordered newest first.

### Examples

Create a todo:

```bash
curl -X POST https://todo-app-gbyj.onrender.com/api/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "Buy milk", "priority": "high", "dueDate": "2026-10-05" }'
```

Mark it as completed:

```bash
curl -X PATCH https://todo-app-gbyj.onrender.com/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{ "completed": true }'
```

Delete it:

```bash
curl -X DELETE https://todo-app-gbyj.onrender.com/api/todos/1
```

Response:

```json
{
  "message": "Todo \"Buy milk\" deleted",
  "todo": {
    "id": 1,
    "title": "Buy milk",
    "completed": true,
    "priority": "high",
    "dueDate": "2026-10-05",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Validation rules

| Field       | Rule                                                           |
| ----------- | -------------------------------------------------------------- |
| `title`     | Required on create. String, 1 to 200 characters after trimming |
| `priority`  | `low`, `medium` (default), or `high`                           |
| `dueDate`   | `YYYY-MM-DD` (a real calendar date) or `null`                  |
| `completed` | Boolean                                                        |
| `:id`       | Positive integer                                               |
| PATCH body  | At least one valid field is required                           |

### Errors

All errors use the same shape:

```json
{ "error": { "message": "Title is required", "status": 400 } }
```

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| `400`  | Invalid input (bad body, filter, or id) |
| `404`  | Todo or route not found                 |
| `500`  | Unexpected server error                 |

## Data model

```sql
CREATE TABLE IF NOT EXISTS todos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  completed   INTEGER NOT NULL DEFAULT 0,
  priority    TEXT    NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  due_date    TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

The schema runs on every startup (`IF NOT EXISTS`), so the app recreates its table automatically if the database file is missing.

## Testing the API

A Postman collection is included in `docs/todo-api.postman_collection.json`.

1. Import the collection into Postman.
2. Create an environment with a variable `baseUrl` set to `http://localhost:3000` (or the live URL).
3. Select that environment and run the collection with the Collection Runner.

The collection has a happy-path flow (create, list, get, update, delete, confirm deleted) plus error cases for validation and not-found responses. Each request includes test scripts.

## Deployment

The app is deployed as a single Render **Web Service** connected to this GitHub repo.

| Setting              | Value                                                     |
| -------------------- | --------------------------------------------------------- |
| Branch               | `main`                                                    |
| Root Directory       | empty (the service needs both `backend/` and `frontend/`) |
| Build Command        | `cd backend && npm install`                               |
| Start Command        | `cd backend && npm start`                                 |
| Environment variable | `NODE_VERSION` set to the Node version used locally       |

Render redeploys automatically on every push to `main`.

## Known limitations

- **Data does not persist on the free tier.** SQLite is a local file, and Render's free disk is ephemeral.
- **Cold starts.** The first request after inactivity can take about a minute.
- **Single user.** There is no authentication, and all todos are shared.
- **Hard delete.** Deleted todos cannot be recovered.

## Future improvements

- User accounts and authentication (v2)
- Persistent storage (a paid disk or a hosted database)
- Editing priority and due date inline
- Delete confirmation and undo
- Automated tests for the API
