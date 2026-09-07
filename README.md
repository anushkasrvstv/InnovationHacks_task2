# Pulse.dev Backend

A clean, validated Node.js and Express REST API for the Pulse.dev developer productivity dashboard. The current implementation uses an in-memory store seeded from `src/data/data.js`; restarting the server resets data. Authentication and a persistent database are intentionally deferred.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The API listens on `http://localhost:4000` by default. The React frontend can call it from another port because CORS is enabled. Set `CORS_ORIGIN` to the frontend origin, or leave it unset during local development.

| Variable | Default | Purpose |
|---|---:|---|
| `PORT` | `4000` | HTTP port |
| `CORS_ORIGIN` | `true` | Allowed browser origin |
| `DATABASE_URL` | empty | Reserved for the database phase |
| `JWT_SECRET` | empty | Reserved for the authentication phase |

## Response and validation conventions

Successful creates return **201**, reads and updates return **200**, and deletes return **204** with an empty body. Invalid POST, PUT, or PATCH bodies return **400** with a clear issue array. Missing resources return **404**. Invalid state transitions return **409**.

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "title", "message": "String must contain at least 1 character(s)" }]
  }
}
```

## Endpoint reference

### Users

`POST /api/users` creates a user. Example body: `{ "username":"Eve", "role":"QA", "avatarInitials":"EV", "velocityPercent":80, "activeTaskCount":1, "completedTaskCount":10, "checkoutToken":"co_eve" }`. `GET /api/users` lists all users, `GET /api/users/:id` returns one, and `PUT /api/users/:id` replaces mutable fields and returns the updated user.

### Projects

`POST /api/projects` creates a project with `name`, `branch`, `status`, `linesAdded`, `linesRemoved`, `progressPercent`, `techStack`, `ownerIds`, and `dueDate`. `GET /api/projects` lists projects; add `?status=review` to filter. `GET /api/projects/:id` and `PUT /api/projects/:id` retrieve or update one. `DELETE /api/projects/:id` returns 204.

```json
{
  "name":"notifications", "branch":"main", "status":"in-progress",
  "linesAdded":1200, "linesRemoved":80, "progressPercent":30,
  "techStack":["React","WebSockets"], "ownerIds":["u-alice"], "dueDate":"2026-10-01"
}
```

### Tasks

`POST /api/tasks` creates a task. `GET /api/tasks` supports `status`, `priority`, `projectId`, and `sort` query parameters; use `sort=targetDate:asc` or `sort=priority:desc`. `GET /api/tasks/:id`, `PUT /api/tasks/:id`, and `DELETE /api/tasks/:id` provide standard resource operations. `PATCH /api/tasks/:id/status` accepts an optional body `{ "status": "done" }` to set the status directly, or an empty body to advance the cycle `todo → in-progress → review → blocked → done → todo`. An invalid status value returns 400, and a missing task returns 404.

```json
{
  "title":"Add dashboard filters", "projectId":"p-pulse-core", "status":"todo",
  "priority":"medium", "assigneeId":"u-alice", "targetDate":"2026-09-15"
}
```

### Focus sessions

`POST /api/focus/start` accepts `{ "userId":"u-alice", "taskId":"a12b7ef" }` and returns a new active session. `POST /api/focus/pause`, `/resume`, and `/stop` each accept `{ "sessionId":"fs-..." }`. Conflicting transitions return 409. `GET /api/focus/today` returns focused seconds, hours, target seconds, and target percentage; add `?userId=u-alice` to scope the result.

### Activity and analytics

`GET /api/activity` returns the feed. Use `?range=weekly` or `?range=monthly` and optionally `?projectId=p-pulse-core`. `GET /api/analytics/velocity` returns sprint days, completed tasks, and `velocityPointsPerDay`. `GET /api/analytics/contributions` returns an object containing one date key per day for the past year, with commit and git-push counts.

### Settings

`GET /api/settings` returns the singleton workspace settings object. `PUT /api/settings` validates and updates all settings fields: `developerHandle`, `workspaceRoot`, `syncIntervalSeconds`, `enableGitStream`, `telemetryReporting`, `colorThemeAccent`, and `editorKeybindings`.

## Seed data

The store includes four users—Alice, Bob, Charlie, and Dave—five named projects, eight tasks, a focus-session sample, activity events, and workspace settings matching the dashboard brief. IDs are stable across restarts for convenient frontend wiring.

## Tech stack

Node.js, Express, CORS, dotenv, Zod, and Nodemon. The app uses a centralized error handler and a small `asyncHandler` wrapper so controllers do not need scattered try/catch blocks.
