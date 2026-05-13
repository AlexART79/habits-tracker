# Habit Tracker with Streaks

A full-stack TypeScript habit tracker for building routines, tracking daily check-ins, and showing streak progress.

## Project Status

Current status: Phase 3 daily check-ins and streak calculations.

Implemented now:

- NestJS API skeleton with `GET /api/health`
- React and Vite web shell
- Tailwind CSS light-theme styling
- Prisma schema for SQLite
- npm workspace scripts for local development, typecheck, lint, and tests
- SSO-only auth entry screen with Google and GitHub routes
- Server-owned cookie session with `GET /api/auth/me` and `POST /api/auth/logout`
- Test/dev mock SSO login endpoint for automated tests and local debugging
- Authenticated habit CRUD with owner-only access
- Habit status transitions for Active, Paused, and Archived habits
- React habit dashboard with loading, empty, error, validation, create, edit, status, and delete states
- Today-only check-ins and undo for active habits
- Current, best, and total streak metrics on habit cards
- Current-month check-in history for each habit

Planned later phases add search/filter UI and WebSocket milestone notifications.

## Stack

- Backend: NestJS
- Frontend: React + Vite
- Styling: Tailwind CSS
- Database: SQLite via Prisma
- Shared code: TypeScript workspace package
- Tests: Vitest, React Testing Library, Supertest

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PowerShell on Windows

## Install

```powershell
npm install
```

## Environment

Copy the backend environment example:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Required local environment variables:

```text
PORT=3001
WEB_ORIGIN=http://localhost:5174
DATABASE_URL=file:./dev.db
APP_TIMEZONE=UTC
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_TEST_MODE=true
WEB_AUTH_SUCCESS_URL=http://localhost:5174/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

Use a long random `SESSION_SECRET` for local sessions. `AUTH_TEST_MODE=true` is for local development and automated tests only; the mock login endpoint is still blocked when `NODE_ENV=production`.

## Database Setup

The backend uses Prisma with SQLite.

Generate the Prisma client:

```powershell
npm run prisma:generate -w apps/api
```

Create or update the local SQLite database:

```powershell
npm run prisma:migrate -w apps/api
```

With `DATABASE_URL=file:./dev.db`, Prisma stores the local database at `apps/api/prisma/dev.db`.

Seed reusable habit/check-in data for manual streak testing:

```powershell
npm run seed
```

The seed targets user `cmp49ummz0000jiqbx6uq6c6j` by default and recreates only its debug habits. To target another existing user for local debugging, set `SEED_USER_ID` first:

```powershell
$env:SEED_USER_ID = "existing-user-id"
npm run seed
```

Windows troubleshooting: if `prisma migrate dev` fails with a blank schema-engine error, the local database may not have been created or migrated. The committed initial migration SQL is present under `apps/api/prisma/migrations`, but `npm run prisma:generate -w apps/api` only regenerates the Prisma client. Use `npm run typecheck`, `npm run lint`, and `npm test` to validate the code path, then rerun or fix migration before relying on the local runtime database.

## Run Locally

Start both apps from the repo root:

```powershell
npm run dev
```

API base URL:

```text
http://localhost:3001/api
```

Web app:

```text
http://localhost:5174
```

Health endpoint:

```text
GET http://localhost:3001/api/health
```

Run the backend only:

```powershell
npm run dev -w apps/api
```

Run the frontend only:

```powershell
npm run dev -w apps/web
```

## Quality Commands

Typecheck all workspaces:

```powershell
npm run typecheck
```

Lint the repo:

```powershell
npm run lint
```

Run tests:

```powershell
npm test
```

Every story/change must include relevant automated tests and must pass typecheck, lint, and tests before being considered complete.

## Authentication

Authentication is SSO only. The app supports Google OAuth/OIDC and GitHub OAuth. Local users are created automatically on first successful sign-in and are identified by `provider + providerUserId`; email is optional because GitHub may not return one.

Session state is owned by the backend in an `express-session` cookie named `habit_tracker_session`. The frontend checks `GET /api/auth/me` on boot, includes cookies on auth API calls, and returns to the login screen after `POST /api/auth/logout` succeeds.

Automated tests and local mock sign-in use `POST /api/auth/test-login`. This endpoint returns a session for a mock provider profile and does not call Google or GitHub. It is unavailable when `NODE_ENV=production`.

## Google OAuth Setup

Create OAuth credentials in Google Cloud Console with this callback URL:

```text
http://localhost:3001/api/auth/google/callback
```

Configure:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

Automated tests must mock or stub Google responses and must not call real Google services.

## GitHub OAuth Setup

Create a GitHub OAuth app with this callback URL:

```text
http://localhost:3001/api/auth/github/callback
```

Configure:

```text
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

GitHub email may be missing. User identity is based on `provider + providerUserId`, not email.

## API Summary

Implemented:

```text
GET /api/health
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/github
GET    /api/auth/github/callback
GET    /api/auth/me
POST   /api/auth/logout
POST   /api/auth/test-login
GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PATCH  /api/habits/:id
DELETE /api/habits/:id
POST   /api/habits/:habitId/check-ins/today
DELETE /api/habits/:habitId/check-ins/today
GET    /api/habits/:habitId/check-ins?month=YYYY-MM
```

All habit, check-in, and notification operations must be scoped to the authenticated user. The backend must never trust a client-provided `userId`.

### Habit API

Habit request fields:

```json
{
  "name": "Read daily",
  "description": "Read for twenty minutes",
  "startDate": "2026-05-13"
}
```

`name` is required, trimmed, and limited to 120 characters. `description` is optional and limited to 500 characters. `startDate` must be a `YYYY-MM-DD` calendar date. `PATCH /api/habits/:id` accepts any subset of `name`, `description`, `startDate`, and `status`.

Habit responses include:

```json
{
  "id": "habit-id",
  "name": "Read daily",
  "description": "Read for twenty minutes",
  "startDate": "2026-05-13",
  "status": "ACTIVE",
  "currentStreak": 1,
  "bestStreak": 3,
  "totalCheckIns": 7,
  "completedToday": true,
  "createdAt": "2026-05-13T12:00:00.000Z",
  "updatedAt": "2026-05-13T12:00:00.000Z"
}
```

`GET /api/habits` returns `{ "habits": [...] }` ordered newest first.

### Habit Status Rules

Supported statuses are `ACTIVE`, `PAUSED`, and `ARCHIVED`.

- `ACTIVE` habits can be paused or archived.
- `PAUSED` habits can be resumed or archived.
- `ARCHIVED` habits are read-only; normal edits return `409 Conflict`.
- `DELETE /api/habits/:id` remains allowed for archived habits.
- Cross-account read, edit, and delete attempts return `403 Forbidden` when the habit exists but belongs to another user.

### Check-in API

The backend owns “today” using `APP_TIMEZONE`; the frontend never sends a check-in date.

```text
POST   /api/habits/:habitId/check-ins/today
DELETE /api/habits/:habitId/check-ins/today
GET    /api/habits/:habitId/check-ins?month=YYYY-MM
```

Rules:

- Only `ACTIVE` habits can receive check-ins.
- A habit can be checked in once per backend-defined calendar date.
- Duplicate today check-ins return `409 Conflict`.
- Paused and archived habits reject check-ins with `409 Conflict`.
- Undo removes only today’s check-in.
- Month history returns the owned habit’s check-ins for the requested `YYYY-MM`.
- Cross-account check-in and history access is blocked.

## WebSocket Message Format

WebSocket milestone notifications are planned for Phase 5.

Client to server:

```json
{
  "type": "milestones.subscribe",
  "payload": {
    "clientTime": "2026-05-12T12:00:00.000Z"
  }
}
```

Client to server acknowledgement:

```json
{
  "type": "notification.ack",
  "payload": {
    "notificationId": "notification-id"
  }
}
```

Server to client:

```json
{
  "type": "milestone.reached",
  "payload": {
    "notificationId": "notification-id",
    "habitId": "habit-id",
    "habitName": "Read",
    "milestone": 7,
    "currentStreak": 7
  }
}
```

WebSocket authorization is mandatory. The server must never send one user's notifications to another user.

## Milestone Notification Rules

Milestones are `3`, `7`, and `30` day streaks.

Notifications are evaluated when the WebSocket connection opens, sent after the client subscribes with `milestones.subscribe`, and stored once per habit per milestone. A stored milestone notification must not repeat on reconnect. `notification.ack` records that the notification was acknowledged.

## Streak Notes

Rules:

- Current streak, best streak, and total check-ins are calculated per habit.
- Streaks are based on consecutive calendar days.
- Current streak counts consecutive check-ins ending on backend-defined today; if today is missing, current streak is `0`.
- A missed required day resets the current streak.
- Paused status does not preserve streak in the MVP.
- Best streak remains the historical maximum.
- Removing today's check-in recalculates the current streak.

## Timezone Handling

`APP_TIMEZONE` defines calendar-day boundaries. The default is `UTC`.

The backend owns the definition of today. Check-in dates are stored as `YYYY-MM-DD` calendar dates, and the frontend must not create arbitrary-date check-ins.

## Habit Deletion Behavior

The MVP behavior is hard delete. Deleting a habit removes the habit and cascades to its check-in history and milestone notifications through Prisma relations.

## Docker

Docker is skipped in Phase 0. The app must run locally with the npm commands documented above.
