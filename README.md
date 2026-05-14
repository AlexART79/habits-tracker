# Habit Tracker with Streaks

A full-stack habit tracker for building routines, recording daily check-ins, searching and filtering habits, and receiving streak milestone notifications. Users sign in with SSO, manage only their own data, and see current streak, best streak, total check-ins, and today's completion state for each habit.

## Tech Stack

- Backend: NestJS, Prisma, SQLite, WebSocket
- Frontend: React, Vite, Tailwind CSS
- Shared code: TypeScript workspace package
- Tests: Vitest, React Testing Library, Supertest
- Package manager: npm workspaces

## Project Structure

```text
habit-tracker/
  apps/
    api/        NestJS API, Prisma schema, auth, habits, check-ins, streaks, notifications
    web/        React and Vite frontend
  packages/
    shared/     Shared TypeScript API types, constants, and domain values
  docs/         Project planning and acceptance documentation
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A terminal on your OS:
  - Linux/macOS: Bash, Zsh, or another POSIX-style shell
  - Windows: PowerShell 7+ or Windows PowerShell

The main workflow uses npm scripts and is the same on Linux, macOS, and Windows.

## Install

From the repository root:

```sh
npm install
```

## Environment

Create a local backend env file from the example.

Linux/macOS:

```sh
cp apps/api/.env.example apps/api/.env
```

Windows PowerShell:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Default local variables:

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

Use a long random `SESSION_SECRET`. Keep `AUTH_TEST_MODE=true` only for local development and automated tests; the test login endpoint is blocked when `NODE_ENV=production`. Login sessions are stored in SQLite, so a valid session cookie remains usable after the API server restarts.

## Database

Generate the Prisma client:

```sh
npm run prisma:generate
```

Create or update the local SQLite database:

```sh
npm run prisma:migrate
```

With `DATABASE_URL=file:./dev.db`, Prisma stores the local database at `apps/api/prisma/dev.db`. The same database stores server-side session records, so run migrations after pulling schema changes.

Seed reusable local habit and check-in data:

```sh
npm run seed
```

To seed an existing user, set `SEED_USER_ID` for the command.

Linux/macOS:

```sh
SEED_USER_ID="existing-user-id" npm run seed
```

Windows PowerShell:

```powershell
$env:SEED_USER_ID = "existing-user-id"
npm run seed
```

## Run Locally

Start the shared package watcher, API, and web app together:

```sh
npm run dev
```

Local URLs:

```text
API:     http://localhost:3001/api
Health:  http://localhost:3001/api/health
Web app: http://localhost:5174
WS:      ws://localhost:3001/ws
```

Run only the API:

```sh
npm run dev -w apps/api
```

Run only the web app:

```sh
npm run dev -w apps/web
```

The Vite dev server runs on port `5174` and proxies `/api` and `/ws` to the backend on port `3001`.

## Verification

Run these checks before considering a change complete:

```sh
npm run typecheck
npm run lint
npm test
```

Package-level checks are also available when you need a smaller loop:

```sh
npm test -w apps/api
npm test -w apps/web
npm test -w packages/shared
```

## OAuth Setup

Authentication is SSO-only. Local user records are created automatically on first successful sign-in. Identity is based on `provider + providerUserId`; GitHub may not return an email address.

### Google

Create OAuth credentials in Google Cloud Console with this callback URL:

```text
http://localhost:3001/api/auth/google/callback
```

Set these variables in `apps/api/.env`:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### GitHub

Create a GitHub OAuth app with this callback URL:

```text
http://localhost:3001/api/auth/github/callback
```

Set these variables in `apps/api/.env`:

```text
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

## API Summary

All authenticated routes are session-based and scoped to the current user. Client-provided user ids are ignored.

```text
GET    /api/health
GET    /api/auth/me
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/github
GET    /api/auth/github/callback
POST   /api/auth/test-login
POST   /api/auth/logout

GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PATCH  /api/habits/:id
DELETE /api/habits/:id

GET    /api/habits/:habitId/check-ins
POST   /api/habits/:habitId/check-ins/today
DELETE /api/habits/:habitId/check-ins/today
```

`GET /api/habits` supports optional `search`, `status`, and `completedToday` query filters. Habit statuses are `ACTIVE`, `PAUSED`, and `ARCHIVED`.

## Habit and Check-In Rules

- Only the authenticated owner can read or change a habit, check-in, or notification.
- Only `ACTIVE` habits can receive new check-ins.
- `PAUSED` and `ARCHIVED` habits cannot receive new check-ins.
- `ARCHIVED` habits are read-only.
- A check-in records completion for one habit on one calendar date.
- Only today's check-in can be created or undone from the frontend.
- Duplicate check-ins for the same habit and date return a conflict.
- Deleting a habit hard-deletes it and cascades its check-in and milestone notification history.

## Streaks and Timezone

Streaks are calculated from consecutive calendar-day check-ins:

- `currentStreak`: consecutive streak through today when today is checked in, otherwise through the most recent completed day.
- `bestStreak`: highest historical consecutive streak.
- `totalCheckIns`: total completed dates for the habit.

Calendar-day boundaries use `APP_TIMEZONE`, which defaults to `UTC`. Check-in dates are stored as `YYYY-MM-DD` strings, and the backend decides what "today" means.

## WebSocket Notifications

The backend accepts authenticated WebSocket connections at:

```text
ws://localhost:3001/ws
```

The browser uses the Vite proxy, so local frontend code can connect through `/ws`.

Client-to-server messages:

```json
{ "type": "milestones.subscribe", "payload": { "clientTime": "2026-05-15T12:00:00.000Z" } }
{ "type": "notification.ack", "payload": { "notificationId": "notification-id" } }
```

Server-to-client milestone message:

```json
{
  "type": "milestone.reached",
  "payload": {
    "notificationId": "notification-id",
    "habitId": "habit-id",
    "habitName": "Drink water",
    "milestone": 7,
    "currentStreak": 7
  }
}
```

Milestones are `3`, `7`, and `30` days. They are evaluated when a WebSocket connection opens, sent once per habit per milestone, and not repeated on reconnect after they have already been triggered.

## Docker

Docker is not required or configured for this project. Use the npm workflow above for local setup and development on Linux, macOS, or Windows.
