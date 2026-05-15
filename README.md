# Habits Tracker

A full-stack habit tracking application with daily check-ins, streak calculations, and real-time milestone notifications.

## Features

- Sign in with Google or GitHub (SSO only, no passwords)
- Create, edit, pause, archive, and delete habits
- Record a daily check-in per habit; undo it if needed
- View current streak, best streak, and total check-in count
- Search and filter habits by name, status, and completion
- Real-time WebSocket notifications when you hit 3-, 7-, or 30-day milestones
- Milestones are not repeated on reconnect
- Light (default) and dark mode — toggle via the sun/moon button in the header; preference is saved in `localStorage`

---

## Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Backend API | NestJS 10, TypeScript 5                                       |
| Frontend    | React 19, Vite 5, Tailwind CSS 3                              |
| Database    | SQLite via Prisma 5                                           |
| Auth        | Passport.js — Google OAuth 2, GitHub OAuth 2, session cookies |
| Real-time   | WebSockets (`@nestjs/websockets` / `socket.io`)               |
| Testing     | Jest + Supertest (API), Vitest + React Testing Library (web)  |

---

## Prerequisites

- Node.js 20 or later
- npm 10 or later

No Docker is required. The app runs locally with a file-based SQLite database.

---

## Install

From the project root:

```sh
npm install
```

This installs dependencies for the root workspace and both `apps/api` and `apps/web`.

---

## Database setup

Run Prisma migrations to create (or update) the SQLite database:

```sh
npm run prisma:migrate
```

Optionally seed the database with sample habits for a test user:

```sh
npm run seed
```

---

## Running the app

### Both apps together (recommended)

```sh
npm run dev
```

This starts the API on **port 3002**, waits for it to be healthy, then starts the web app on **port 5175**.

| App    | URL                          |
| ------ | ---------------------------- |
| Web    | http://localhost:5175        |
| API    | http://localhost:3002        |
| Health | http://localhost:3002/health |

### Individual apps

```sh
# API only
npm run dev -w apps/api

# Web only
npm run dev -w apps/web
```

---

## Tests

```sh
# All tests (root scripts + API + web)
npm test

# Type checking
npm run typecheck

# Lint
npm run lint
```

---

## Environment variables

Create `apps/api/.env` by copying the example:

```sh
copy apps\api\.env.example apps\api\.env
```

Then fill in the values:

| Variable               | Required | Description                                           |
| ---------------------- | -------- | ----------------------------------------------------- |
| `DATABASE_URL`         | Yes      | SQLite path, e.g. `file:./prisma/dev.db`              |
| `SESSION_SECRET`       | Yes      | Random 64-character string for session signing        |
| `GOOGLE_CLIENT_ID`     | Yes\*    | OAuth client ID from Google Cloud Console             |
| `GOOGLE_CLIENT_SECRET` | Yes\*    | OAuth client secret from Google Cloud Console         |
| `GOOGLE_CALLBACK_URL`  | Yes\*    | `http://localhost:3002/auth/google/callback`          |
| `GITHUB_CLIENT_ID`     | Yes\*    | OAuth client ID from GitHub developer settings        |
| `GITHUB_CLIENT_SECRET` | Yes\*    | OAuth client secret from GitHub developer settings    |
| `GITHUB_CALLBACK_URL`  | Yes\*    | `http://localhost:3002/auth/github/callback`          |
| `FRONTEND_URL`         | Yes      | `http://localhost:5175` (used for CORS and redirects) |
| `APP_TIMEZONE`         | No       | IANA timezone name, default `UTC`                     |
| `SEED_USER_PROVIDER`   | No       | OAuth provider name of the user to seed data for      |
| `SEED_USER_EMAIL`      | No       | E-mail of the user to seed data for                   |

\* Required for the corresponding OAuth provider to work. Both providers can coexist.

---

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. Application type: **Web application**.
4. Add `http://localhost:3002/auth/google/callback` to **Authorized redirect URIs**.
5. Copy the **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## GitHub OAuth setup

1. Go to **GitHub** → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Set **Homepage URL** to `http://localhost:5175`.
3. Set **Authorization callback URL** to `http://localhost:3002/auth/github/callback`.
4. Copy the **Client ID** and generate a **Client secret** into `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

---

## API reference

### Auth

```
GET   /auth/google                 Redirect to Google OAuth
GET   /auth/google/callback        Google OAuth callback
GET   /auth/github                 Redirect to GitHub OAuth
GET   /auth/github/callback        GitHub OAuth callback
GET   /auth/me                     Return authenticated user (401 if not logged in)
POST  /auth/logout                 Destroy session
POST  /auth/test-login             Dev/test only — mock login without OAuth
```

### Habits

```
GET    /habits                     List habits (supports ?search=, ?status=, ?completedToday=)
POST   /habits                     Create habit
GET    /habits/:id                 Get single habit
PATCH  /habits/:id                 Update habit
DELETE /habits/:id                 Delete habit (cascades check-ins and notifications)
```

### Check-ins

```
POST   /habits/:habitId/check-ins/today         Record today's check-in
DELETE /habits/:habitId/check-ins/today         Remove today's check-in
GET    /habits/:habitId/check-ins?month=YYYY-MM List check-in dates for a month
```

### Health

```
GET  /health    Returns { status: "ok" }
```

---

## WebSocket protocol

The web client connects to the API WebSocket gateway after authentication. The connection uses `socket.io`.

### Subscribe to milestones

Send immediately after connecting:

```json
{
  "type": "milestones.subscribe",
  "payload": {
    "clientTime": "2026-05-16T10:00:00.000Z"
  }
}
```

### Milestone notification (server → client)

```json
{
  "type": "milestone.reached",
  "payload": {
    "notificationId": "notif_abc123",
    "habitId": "habit_xyz789",
    "habitName": "Read every day",
    "milestone": 7,
    "currentStreak": 7
  }
}
```

Milestone values are `3`, `7`, and `30`.

### Acknowledge a notification (client → server)

```json
{
  "type": "notification.ack",
  "payload": {
    "notificationId": "notif_abc123"
  }
}
```

Once acknowledged, the notification is not sent again on reconnect.

---

## Milestone notification rules

- Milestones are triggered at streak lengths of **3**, **7**, and **30** consecutive days.
- Each milestone is sent **at most once per habit** — tracked in the `MilestoneNotification` table.
- On reconnect, only unacknowledged milestones are re-sent.
- Milestones from other users are never visible to the current user.

---

## Streak calculation

- A streak is the count of **consecutive calendar days** (in the app timezone) on which a check-in was recorded.
- Missing one day resets the current streak to zero; the best streak is preserved.
- Pausing a habit does **not** break a streak — the streak resumes from where it left off.
- Check-in dates are stored as `YYYY-MM-DD` strings; the backend converts them using `APP_TIMEZONE`.

---

## Timezone handling

All date calculations run on the backend. The timezone is controlled by the `APP_TIMEZONE` environment variable (IANA format, e.g. `America/New_York`). Default is `UTC`.

The client sends its local `clientTime` in the WebSocket subscribe message so the backend can verify that "today" is consistent. The backend's definition of "today" is authoritative.

---

## Habit deletion behavior

Deleting a habit permanently removes:

- The habit record
- All check-ins for that habit
- All milestone notifications for that habit

This is enforced via Prisma cascade deletes and cannot be undone.

---

## Docker

Docker is not included. The app runs locally with SQLite — no container setup is required.

---

## Acceptance checklist

- [ ] Sign in with Google
- [ ] Sign in with GitHub
- [ ] First SSO sign-in creates local user
- [ ] Create habit
- [ ] Edit habit
- [ ] Delete habit
- [ ] Check in today
- [ ] Undo today check-in
- [ ] Current streak displayed
- [ ] Best streak displayed
- [ ] Total check-ins displayed
- [ ] Search habits
- [ ] Filter habits
- [ ] Cross-user access blocked
- [ ] 3-day WebSocket milestone received
- [ ] 7-day WebSocket milestone received
- [ ] 30-day WebSocket milestone received
- [ ] Milestones not repeated on reconnect
- [ ] Client sends meaningful WebSocket message
- [ ] App runs locally
- [ ] Tests pass locally
