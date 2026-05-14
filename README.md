# Habit Tracker with Streaks

A full-stack habit tracker for building routines, recording daily check-ins, and viewing streak progress. Users sign in with SSO, manage their own habits, check in for today, search and filter habits, and receive milestone notifications for streak achievements.

## Project Structure

```text
habit-tracker/
  apps/
    api/      NestJS API, Prisma schema, auth, habits, check-ins, streaks, notifications
    web/      React and Vite frontend
  packages/
    shared/   Shared TypeScript API types, constants, and domain values
  docs/       Project planning and acceptance documentation
```

## Tech Stack

- Backend: NestJS
- Frontend: React + Vite
- Styling: Tailwind CSS
- Database: SQLite via Prisma
- Shared code: TypeScript workspace package
- Tests: Vitest, React Testing Library, Supertest
- Realtime: WebSocket milestone notifications

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PowerShell on Windows

## Install

From the repository root:

```powershell
npm install
```

## Environment

Copy the backend environment example:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Local backend variables:

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

Use a long random `SESSION_SECRET`. Keep `AUTH_TEST_MODE=true` for local development and automated tests only; the test login endpoint is blocked when `NODE_ENV=production`. Login sessions are stored in the SQLite database so a valid session cookie remains usable after the API server restarts.

## Database

Generate the Prisma client:

```powershell
npm run prisma:generate
```

Create or update the local SQLite database:

```powershell
npm run prisma:migrate
```

With `DATABASE_URL=file:./dev.db`, Prisma stores the local database at `apps/api/prisma/dev.db`. The same database stores server-side session records, so run migrations after pulling schema changes.

Seed reusable local habit and check-in data:

```powershell
npm run seed
```

To seed an existing user instead of the default debug user:

```powershell
$env:SEED_USER_ID = "existing-user-id"
npm run seed
```

## Run Locally

Start the shared package watcher, API, and web app together:

```powershell
npm run dev
```

Local URLs:

```text
API:     http://localhost:3001/api
Health:  http://localhost:3001/api/health
Web app: http://localhost:5174
```

Run only the API:

```powershell
npm run dev -w apps/api
```

Run only the web app:

```powershell
npm run dev -w apps/web
```

The Vite dev server proxies `/api` and `/ws` to the backend on port `3001`.

## Verification Commands

Typecheck:

```powershell
npm run typecheck
```

Lint:

```powershell
npm run lint
```

Tests:

```powershell
npm test
```

## Google OAuth Setup

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

## GitHub OAuth Setup

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

GitHub may not return an email address, so local identity is based on provider and provider user id.

## Docker

Docker is not required or configured for this project. Use the npm workflow above for local setup and development.
