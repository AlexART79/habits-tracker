# Phase 6 Acceptance

This document tracks final evaluation checks for the Habit Tracker with Streaks MVP.

## Automated Verification

Record the latest local run results here:

```text
npm run typecheck: passed on 2026-05-14
npm run lint: passed on 2026-05-14
npm test: passed on 2026-05-14 after rerun; first run had one transient frontend WebSocket timing failure
```

## Runtime Smoke Checks

Record the latest local runtime checks here:

```text
npm run dev: started in a temporary PowerShell job on 2026-05-14
GET http://localhost:3001/api/health: passed, returned 200 with status ok
Open http://localhost:5174: passed, returned 200 with the Vite app root
```

## Manual Acceptance Checklist

- [ ] User can sign in with Google.
- [ ] User can sign in with GitHub.
- [ ] First SSO sign-in creates a local user.
- [ ] User can create a habit.
- [ ] User can edit a habit.
- [ ] User can delete a habit.
- [ ] User can check in today.
- [ ] User can undo today's check-in.
- [ ] Current streak is displayed.
- [ ] Best streak is displayed.
- [ ] Total check-ins are displayed.
- [ ] User can search habits.
- [ ] User can filter habits.
- [ ] Cross-account data access is blocked.
- [ ] WebSocket sends a 3-day milestone notification.
- [ ] WebSocket sends a 7-day milestone notification.
- [ ] WebSocket sends a 30-day milestone notification.
- [ ] Milestone notification is not repeated after acknowledgement and reconnect.
- [ ] Client sends `milestones.subscribe`.
- [x] App runs locally from README commands.
- [x] Typecheck, lint, and tests pass locally.

## Manual Verification Notes

### OAuth

Google and GitHub sign-in require real OAuth app credentials in `apps/api/.env`.

Use these local callback URLs:

```text
Google: http://localhost:3001/api/auth/google/callback
GitHub: http://localhost:3001/api/auth/github/callback
```

Automated tests use mock or stub SSO flows and must not call real Google or GitHub services.

### WebSocket Milestones

Milestone notifications use `/ws` with the authenticated session cookie.

Client to server subscribe message:

```json
{
  "type": "milestones.subscribe",
  "payload": {
    "clientTime": "2026-05-14T00:00:00.000Z"
  }
}
```

Client to server acknowledgement message:

```json
{
  "type": "notification.ack",
  "payload": {
    "notificationId": "notification-id"
  }
}
```

Server to client milestone message:

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

Manual 7-day path:

1. Run `npm run seed`.
2. Sign in as the seeded user or set `SEED_USER_ID` to an existing local user before seeding.
3. Check in `Seed: Click today for 7-day milestone`.
4. Refresh the web app to reconnect the socket.
5. Confirm the 7-day milestone notification appears.
6. Dismiss it and refresh again.
7. Confirm the acknowledged notification does not repeat.

Latest status: automated API tests cover 3, 7, and 30 day milestone delivery, reconnect behavior, and acknowledgement ownership. Manual seeded-user WebSocket verification remains available through the steps above.

### Local Runtime

Start the project with:

```powershell
npm run dev
```

Expected local endpoints:

```text
GET http://localhost:3001/api/health
Open http://localhost:5174
```
