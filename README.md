# Habit Tracker with Streaks

A full-stack TypeScript habit tracker for building routines, tracking daily check-ins, and showing streak progress.

## Project Status

Current status: Phase 0 foundation.

Implemented now:

- NestJS API skeleton with `GET /api/health`
- React and Vite web shell
- Tailwind CSS light-theme styling
- Prisma schema for SQLite
- npm workspace scripts for local development, typecheck, lint, and tests

Planned later phases add SSO auth, habit CRUD, check-ins, streak calculations, search/filter UI, and WebSocket milestone notifications.

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
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=file:./dev.db
APP_TIMEZONE=UTC
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

OAuth values can stay blank during Phase 0 because the OAuth flows are not implemented yet.

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
http://localhost:5173
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

## Google OAuth Setup

Google OAuth is planned for Phase 1. When implemented, create OAuth credentials in Google Cloud Console and configure:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

Automated tests must mock or stub Google responses and must not call real Google services.

## GitHub OAuth Setup

GitHub OAuth is planned for Phase 1. When implemented, create a GitHub OAuth app and configure:

```text
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

GitHub email may be missing. User identity is based on `provider + providerUserId`, not email.

## API Summary

Implemented in Phase 0:

```text
GET /api/health
```

Planned API surface:

```text
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/github
GET    /api/auth/github/callback
GET    /api/auth/me
POST   /api/auth/logout
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

Streak calculation is planned for Phase 3 and should be implemented as pure, well-tested logic.

Rules:

- Current streak, best streak, and total check-ins are calculated per habit.
- Streaks are based on consecutive calendar days.
- A missed required day resets the current streak.
- Paused status does not preserve streak in the MVP.
- Best streak remains the historical maximum.
- Removing today's check-in recalculates the current streak.

## Timezone Handling

`APP_TIMEZONE` defines calendar-day boundaries. The default is `UTC`.

The backend owns the definition of today. Check-in dates are stored as `YYYY-MM-DD` calendar dates, and the frontend must not create arbitrary-date check-ins.

## Habit Deletion Behavior

The planned MVP behavior is hard delete. Deleting a habit cascades to its check-in history and milestone notifications.

## Docker

Docker is skipped in Phase 0. The app must run locally with the npm commands documented above.
