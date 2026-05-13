# Phased development plan

## Global quality gate for every phase

A phase is **not complete** until all of these pass:

```powershell
npm run typecheck
npm run lint
npm test
```

Suggested root scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "typecheck": "npm run typecheck -w apps/api && npm run typecheck -w apps/web",
    "lint": "npm run lint -w apps/api && npm run lint -w apps/web",
    "test": "npm test -w apps/api && npm test -w apps/web"
  }
}
```

For Windows/PowerShell-focused agents, avoid relying on Bash-only syntax in instructions. In docs, prefer separate commands or PowerShell-compatible commands.

---

# Proposed repository structure

```text
habit-tracker/
  AGENTS.md
  README.md
  package.json
  apps/
    api/
      src/
        app.module.ts
        main.ts
        auth/
        users/
        habits/
        check-ins/
        streaks/
        notifications/
        prisma/
      prisma/
        schema.prisma
      test/
    web/
      src/
        app/
        components/
        features/
          auth/
          habits/
          check-ins/
          notifications/
        lib/
        test/
      index.html
  packages/
    shared/
      src/
        api-types.ts
        constants.ts
```

`packages/shared` is optional, but helpful for shared enums, DTO-like response types, WebSocket event names, and milestone constants.

---

# Data model

Use Prisma with SQLite.

## Core tables

```text
User
- id
- provider
- providerUserId
- email nullable
- displayName
- avatarUrl nullable
- createdAt
- updatedAt

Unique:
- provider + providerUserId

Habit
- id
- userId
- name
- description nullable
- startDate as YYYY-MM-DD or DateTime normalized to app timezone
- status: ACTIVE | PAUSED | ARCHIVED
- createdAt
- updatedAt

CheckIn
- id
- habitId
- userId
- date as YYYY-MM-DD
- createdAt

Unique:
- habitId + date

MilestoneNotification
- id
- userId
- habitId
- milestone: 3 | 7 | 30
- sentAt
- acknowledgedAt nullable

Unique:
- habitId + milestone
```

## Timezone decision

Use an explicit app-level timezone:

```text
APP_TIMEZONE=UTC
```

Backend owns the definition of “today.” The frontend must not independently decide whether a check-in is for today. It should ask the backend or use dates returned by the backend.

Store check-in dates as calendar dates: `YYYY-MM-DD`.

Document this in README:

```text
The MVP uses APP_TIMEZONE to define “today” and streak boundaries.
Default APP_TIMEZONE is UTC. All check-in dates are stored as YYYY-MM-DD calendar dates.
```

---

# Phase 0 — Project foundation and local skeleton

## Goal

Create a runnable monorepo with a minimal NestJS API, React UI, Tailwind styling, SQLite/Prisma setup, linting, typechecking, and test infrastructure.

## Working app delivered

* Backend starts locally.
* Frontend starts locally.
* Frontend can call backend health endpoint.
* Basic styled page renders.
* SQLite/Prisma is configured.
* Test, lint, and typecheck scripts exist.

## Stories

### 0.1 — Initialize monorepo

Tasks:

1. Create root `package.json`.
2. Create `apps/api` NestJS app.
3. Create `apps/web` React/Vite app.
4. Configure TypeScript strict mode.
5. Configure ESLint and Prettier.
6. Add root scripts for `dev`, `typecheck`, `lint`, `test`.

Tests:

* Backend default health/controller test.
* Frontend smoke render test.

Acceptance:

* `npm run dev` starts both apps.
* API health endpoint returns `200`.
* Web app displays a basic shell.

---

### 0.2 — Add Tailwind and basic design shell

Tasks:

1. Install Tailwind in `apps/web`.
2. Add base layout:

   * header
   * main content area
   * responsive container
   * light theme only
3. Define reusable button/input/card styles using Tailwind utility classes.

Tests:

* Render shell test.
* Verify main heading exists.
* Verify primary action button is accessible by role/name.

Acceptance:

* UI has consistent spacing and typography.
* Interactive elements have visible hover/focus states.

---

### 0.3 — Add Prisma + SQLite

Tasks:

1. Install Prisma in `apps/api`.
2. Add SQLite datasource.
3. Create initial schema with `User`, `Habit`, `CheckIn`, `MilestoneNotification`.
4. Add migration scripts.
5. Add Prisma service/module.

Tests:

* Prisma service initializes in test environment.
* Basic database cleanup helper exists for integration tests.

Acceptance:

* `npm run prisma:migrate -w apps/api` creates local DB.
* API can connect to SQLite.

---

# Phase 1 — Authentication and user isolation foundation

## Goal

Implement SSO-only auth foundation with Google and GitHub providers, plus test-mode mock provider support.

## Working app delivered

* Auth entry screen with “Continue with Google” and “Continue with GitHub”.
* Backend creates local user record on first successful sign-in.
* Session persists across refresh.
* Logout works.
* Test mode does not call real Google/GitHub.

## Stories

### 1.1 — Auth domain and session model

Tasks:

1. Add auth module.
2. Add session middleware/cookie support.
3. Store authenticated user in server session.
4. Add `GET /auth/me`.
5. Add `POST /auth/logout`.

Tests:

* Unauthenticated `GET /auth/me` returns `401`.
* Authenticated test session returns current user.
* Logout clears session.

Acceptance:

* Frontend can detect authenticated vs unauthenticated state.
* Auth persists across page refresh.

---

### 1.2 — Mock SSO provider for tests/dev

Tasks:

1. Add test-only mock SSO callback.
2. Mock provider returns:

   * provider
   * providerUserId
   * email
   * displayName
   * avatarUrl
3. Backend creates or finds local user by `provider + providerUserId`.

Tests:

* First mock login creates user.
* Repeated mock login reuses same user.
* Same provider user ID with different provider creates separate account.

Acceptance:

* Required SSO success-path test exists without real network calls.

---

### 1.3 — Google OAuth/OIDC and GitHub OAuth

Tasks:

1. Add Google strategy.
2. Add GitHub strategy.
3. Add callback endpoints.
4. Add required env vars:

   * `GOOGLE_CLIENT_ID`
   * `GOOGLE_CLIENT_SECRET`
   * `GOOGLE_CALLBACK_URL`
   * `GITHUB_CLIENT_ID`
   * `GITHUB_CLIENT_SECRET`
   * `GITHUB_CALLBACK_URL`
5. Document that GitHub email may be missing and identity uses `provider + providerUserId`.

Tests:

* Strategy profile mapping unit tests.
* Mock strategy remains used in automated tests.

Acceptance:

* Google and GitHub buttons route to backend auth start endpoints.
* README documents OAuth setup.

---

### 1.4 — Frontend auth UI

Tasks:

1. Add login page.
2. Add auth provider/client state.
3. Add protected app layout.
4. Add logout button.
5. Add loading and error states.

Tests:

* Login page renders both SSO buttons.
* Authenticated shell renders user display name.
* Logout action calls API and returns to login screen.

Acceptance:

* User can sign in and refresh without losing auth.

---

# Phase 2 — Habit CRUD

## Goal

Authenticated users can create, view, edit, archive, pause, resume, and delete their own habits.

## Working app delivered

* Main habit list.
* Create/edit UI.
* Status changes.
* Owner-only data access.
* Server and client validation.

## Stories

### 2.1 — Habit API

Endpoints:

```text
GET    /habits
POST   /habits
GET    /habits/:id
PATCH  /habits/:id
DELETE /habits/:id
```

Tasks:

1. Add DTOs:

   * create habit
   * update habit
   * list filters later-ready
2. Validate:

   * name required, trimmed, max length
   * description optional, max length
   * start date valid
   * status enum only
3. Enforce owner access on every operation.
4. Archived habits are read-only except delete.
5. Choose deletion behavior:

   * recommended: hard delete habit and cascade check-ins.
6. Document deletion behavior in README.

Tests:

* Create valid habit.
* Reject empty name.
* Reject invalid status.
* User cannot read another user’s habit.
* User cannot edit another user’s habit.
* Archived habit cannot be edited.
* Delete removes own habit.

Acceptance:

* API supports full habit CRUD for authenticated user.

---

### 2.2 — Habit list UI

Tasks:

1. Fetch habits.
2. Render cards/list.
3. Show empty state for no habits.
4. Show loading state.
5. Show error state.
6. Add responsive layout.

Tests:

* Loading state renders.
* Empty state renders.
* Habit card renders name/status.
* API error shows visible error message.

Acceptance:

* Authenticated user can see own habits.

---

### 2.3 — Create/edit habit UI

Tasks:

1. Add modal/drawer/page for create/edit.
2. Add client validation feedback.
3. Disable submit while saving.
4. Show server validation errors.
5. Refresh habit list after mutation.

Tests:

* Required name validation appears.
* Create form submits valid data.
* Edit form loads existing values.
* Server error is visible.

Acceptance:

* User can create and edit habits from UI.

---

### 2.4 — Status transitions

Tasks:

1. Add status buttons/actions:

   * Active → Paused
   * Paused → Active
   * Active/Paused → Archived
2. Disable edit/check-in actions for Archived habits.
3. Show archived read-only state.

Tests:

* Active habit can be paused.
* Paused habit can be resumed.
* Archived habit is read-only.
* Archived habit cannot receive normal edit mutation.

Acceptance:

* Status business rules are enforced both server-side and UI-side.

---

# Phase 3 — Daily check-ins and streak calculations

## Goal

Users can check in active habits for today, undo today’s check-in, and see current streak, best streak, and total check-ins.

## Working app delivered

* Today check-in and undo controls.
* Streak summary on habit cards.
* Correct duplicate/future/past protection.
* Current month check-in history.

## Stories

### 3.1 — Check-in API

Endpoints:

```text
POST   /habits/:habitId/check-ins/today
DELETE /habits/:habitId/check-ins/today
GET    /habits/:habitId/check-ins?month=YYYY-MM
```

Tasks:

1. Backend calculates today using `APP_TIMEZONE`.
2. Allow check-in only for Active habits.
3. Reject duplicate check-in via DB unique constraint and service validation.
4. Disallow future-date check-ins by not exposing arbitrary-date create endpoint.
5. Undo only today’s check-in.
6. Enforce owner access.

Tests:

* Create today check-in.
* Prevent duplicate check-in for same habit/date.
* Reject check-in for Paused habit.
* Reject check-in for Archived habit.
* User cannot check in another user’s habit.
* Undo today check-in.
* Undo another user’s check-in is forbidden.

Acceptance:

* Required create check-in and duplicate-prevention tests pass.

---

### 3.2 — Streak service

Tasks:

1. Implement pure streak calculation function:

   * input: sorted check-in dates
   * output: current streak, best streak, total
2. Current streak is consecutive days up to backend-defined today.
3. Missed day resets current streak.
4. Paused status does not preserve streak.
5. Removing today’s check-in recalculates current streak.

Tests:

* Current streak 0 when no check-ins.
* Current streak 1 for today only.
* Current streak 3 for today + previous 2 days.
* Current streak resets when yesterday is missing.
* Best streak remains historical max.
* Undo today recalculates correctly.
* 3, 7, 30-day streak fixtures.

Acceptance:

* Streak rules are implemented as pure, heavily tested logic.

---

### 3.3 — Habit list with streak summary and check-in controls

Tasks:

1. Extend habit list response with:

   * currentStreak
   * bestStreak
   * totalCheckIns
   * completedToday
2. Add check-in/undo buttons.
3. Disable check-in for Paused/Archived habits.
4. Show optimistic or loading state on button click.

Tests:

* Active habit shows check-in button.
* Completed habit shows undo button.
* Paused/Archived habit has disabled or hidden check-in action.
* Streak values render.

Acceptance:

* Main screen satisfies required habit list metrics.

---

### 3.4 — Habit details and current month calendar

Tasks:

1. Add details screen/section.
2. Show habit information.
3. Show current month check-in calendar.
4. Show “no check-ins yet” empty state.
5. Show streak summary.

Tests:

* Details page renders habit info.
* Calendar marks checked-in dates.
* No check-ins empty state appears.

Acceptance:

* User can review progress for current month.

---

# Phase 4 — Search, filters, and responsive UI hardening

## Goal

Complete required search/filter flows and improve UI polish.

## Working app delivered

* Search by name/description.
* Status filter.
* Completed today / not completed today filter.
* Mobile-friendly cards.
* Clear empty states.

## Stories

### 4.1 — Backend list filters

Query params:

```text
GET /habits?search=&status=ACTIVE&completedToday=true
```

Tasks:

1. Add validated query DTO.
2. Search name and description.
3. Filter by status.
4. Filter Active habits by completed today / not completed today.
5. Keep authorization scoped to current user.

Tests:

* Search matches name.
* Search matches description.
* Status filter works.
* Completed-today filter works.
* Not-completed-today filter works.
* Filters never leak another user’s data.

Acceptance:

* API supports all filtering requirements.

---

### 4.2 — Frontend search and filters

Tasks:

1. Add search input.
2. Add status filter.
3. Add completed-today filter.
4. Debounce search lightly or submit immediately.
5. Show “no search results” empty state.

Tests:

* Typing search updates query.
* Selecting status filter refetches or filters.
* No results empty state renders.
* Filter controls are keyboard accessible.

Acceptance:

* User can find and filter habits from main screen.

---

### 4.3 — Responsive and interaction polish

Tasks:

1. Use mobile-first Tailwind layout.
2. Convert table/list to cards on narrow screens.
3. Add visible hover/focus states.
4. Ensure forms are usable on small screens.
5. Add consistent spacing and typography.
6. Keep existing dark/light theme support, with dark mode as the default.

Tests:

* Component tests verify major responsive-safe content exists.
* Accessibility-oriented queries by role/name.
* No reliance on test IDs unless necessary.

Acceptance:

* UI meets “modern, styled, responsive, interactive” requirement.

---

# Phase 5 — WebSocket milestone notifications

## Goal

Implement required two-way WebSocket communication and non-repeating milestone notifications.

## Working app delivered

* Authenticated WebSocket connection.
* Client sends meaningful `milestones.subscribe`.
* Server evaluates milestones when connection opens.
* Server sends 3/7/30-day milestone notifications once per habit per milestone.
* Client displays notifications.
* Client can acknowledge notifications.

## Recommended WebSocket contract

Client → server:

```json
{
  "type": "milestones.subscribe",
  "payload": {
    "clientTime": "2026-05-12T12:00:00.000Z"
  }
}
```

Server → client:

```json
{
  "type": "milestone.reached",
  "payload": {
    "notificationId": "notif_123",
    "habitId": "habit_123",
    "habitName": "Read",
    "milestone": 7,
    "currentStreak": 7
  }
}
```

Client → server:

```json
{
  "type": "notification.ack",
  "payload": {
    "notificationId": "notif_123"
  }
}
```

Server behavior:

1. Authenticate WebSocket handshake using the same session cookie.
2. On connection open, evaluate untriggered milestones.
3. Store pending untriggered milestones.
4. Only emit them after `milestones.subscribe`.
5. Insert `MilestoneNotification` record before or transactionally with emit decision.
6. Never resend existing `habitId + milestone` notification on reconnect.
7. `notification.ack` sets `acknowledgedAt`.

This preserves the requirement that milestones are evaluated when the connection opens while making the client → server message meaningful.

## Stories

### 5.1 — Authenticated WebSocket gateway

Tasks:

1. Add notifications gateway.
2. Authenticate socket from session cookie.
3. Reject unauthenticated sockets.
4. Associate socket with `userId`.

Tests:

* Unauthenticated socket is rejected.
* Authenticated socket connects.
* Socket user context is available.

Acceptance:

* WebSocket authorization exists.

---

### 5.2 — Milestone evaluation

Tasks:

1. Add milestone service.
2. Evaluate current streaks for user’s habits.
3. Detect milestones: 3, 7, 30.
4. Check existing `MilestoneNotification` rows.
5. Create only missing notifications.

Tests:

* Sends 3-day milestone.
* Sends 7-day milestone.
* Sends 30-day milestone.
* Does not send unreached milestone.
* Does not resend already-created milestone.
* Does not send another user’s milestone.

Acceptance:

* Required milestone tests pass.

---

### 5.3 — Client subscribe and notification UI

Tasks:

1. Connect to WebSocket after auth.
2. Send `milestones.subscribe`.
3. Listen for `milestone.reached`.
4. Show toast/banner/panel notification.
5. Send `notification.ack` when user dismisses or when displayed, depending on chosen UX.
6. Document behavior in README.

Tests:

* Client sends subscribe message.
* Milestone notification renders.
* Ack message is sent after dismiss/action.

Acceptance:

* Visible real-time milestone notifications exist in UI.

---

# Phase 6 — Final acceptance, README, and hardening

## Goal

Make the project ready for evaluation by humans and coding agents.

## Working app delivered

* Complete MVP.
* README has local run instructions.
* All acceptance checklist items are covered.
* Tests pass locally.
* Known simplifications are documented.

## Stories

### 6.1 — README completion

README must include:

1. Project overview.
2. Stack.
3. Local prerequisites.
4. Install commands.
5. Backend run commands.
6. Frontend run commands.
7. Database migration commands.
8. Test commands.
9. Google OAuth setup.
10. GitHub OAuth setup.
11. Required environment variables.
12. API summary.
13. WebSocket message format.
14. Milestone notification rules.
15. Streak calculation notes.
16. Timezone handling.
17. Habit deletion behavior.
18. Docker note:

    * either instructions
    * or explicit “Docker skipped” note

Tests:

* No automated test needed, but agent must manually verify README commands are accurate.

Acceptance:

* A fresh developer can run the project locally from README.

---

### 6.2 — Acceptance checklist verification

Create a checklist in README or `docs/acceptance.md`:

```text
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
```

Acceptance:

* Final phase is not complete until this checklist is verified.

---

# API summary for implementation

## Auth

```text
GET  /auth/google
GET  /auth/google/callback
GET  /auth/github
GET  /auth/github/callback
GET  /auth/me
POST /auth/logout
```

Optional test/dev only:

```text
POST /auth/test-login
```

## Habits

```text
GET    /habits
POST   /habits
GET    /habits/:id
PATCH  /habits/:id
DELETE /habits/:id
```

## Check-ins

```text
POST   /habits/:habitId/check-ins/today
DELETE /habits/:habitId/check-ins/today
GET    /habits/:habitId/check-ins?month=YYYY-MM
```

## Health

```text
GET /health
```
