# Backend rules

## NestJS

Organize by feature module:

- auth
- users
- habits
- check-ins
- streaks
- notifications
- prisma

Controllers should be thin.

Business rules belong in services.

Use DTO classes for request validation.

Use a global ValidationPipe with:

- whitelist: true
- forbidNonWhitelisted: true
- transform: true

Use guards for authentication and authenticated HTTP routes.

Use authenticated WebSocket handshake/session validation.

Always enforce ownership in service/query layer.

Use clear HTTP errors:

- 400 for validation/business input errors
- 401 for unauthenticated requests
- 403 for cross-user access attempts
- 404 when an owned resource does not exist
- 409 for duplicate check-ins or unique constraint conflicts

Do not expose internal stack traces in API responses.

Never trust client-provided userId.

## Database

Use Prisma with SQLite.

Required domain models:

- User
- Habit
- CheckIn
- MilestoneNotification

Identity is based on:

provider + providerUserId

Do not assume email is always available from GitHub.

A check-in must be unique per habit per date.

Milestone notification must be unique per habit per milestone.

Use migrations for schema changes.

Do not manually edit generated Prisma client files.

## Auth

Authentication is SSO only.

Required providers:

- Google OAuth / OpenID Connect
- GitHub OAuth

Local user record must be created automatically on first successful SSO sign-in.

Account linking is not required.

If the same person signs in with Google and GitHub, they may be treated as separate accounts.

Session must persist across page refresh.

Logout must clear the session.

Automated tests must use mock/stub SSO provider responses.

## Habit rules

Habit fields:

- name
- description/notes
- start date
- status: ACTIVE, PAUSED, ARCHIVED

Allowed operations:

- create
- edit
- change status
- delete, if implemented

Business rules:

- Only ACTIVE habits can receive check-ins.
- PAUSED habits cannot receive new check-ins.
- ARCHIVED habits cannot receive new check-ins.
- ARCHIVED habits are read-only.
- Delete behavior must be documented in README.

Recommended delete behavior:

- Hard delete habit and cascade delete its check-in history.

## Check-in rules

A check-in records completion of one habit on one calendar date.

Rules:

- One check-in per habit per date.
- User can add a check-in for today.
- User can undo today's check-in.
- Backfilling past dates is not required.
- Future-date check-ins are not allowed.
- Backend defines today.
- Frontend must not create arbitrary-date check-ins.

## Streak rules

For each habit, calculate:

- current streak
- best streak
- total check-ins

Rules:

- Streaks are based on consecutive calendar days.
- A missed required day resets current streak.
- Paused status does not preserve streak in MVP.
- Best streak remains the historical maximum.
- Removing today's check-in must recalculate current streak.

Implement streak calculation as pure, well-tested logic.

## Timezone rules

Use APP_TIMEZONE to define calendar-day boundaries.

Default:

APP_TIMEZONE=UTC

Store check-in dates as YYYY-MM-DD calendar dates.

Document timezone behavior in README.

## WebSocket rules

The app must include two-way WebSocket communication.

Required server-to-client milestone notifications:

- 3 days
- 7 days
- 30 days

Milestone notifications:

- are evaluated when the WebSocket connection opens
- are sent once per habit per milestone
- must not repeat on reconnect if already triggered
- must be visible in the UI

Required client-to-server message:

milestones.subscribe

Recommended client-to-server ack message:

notification.ack

Document WebSocket message types and payloads in README.

WebSocket authorization is mandatory.

Never send one user's notifications to another user.

## Testing

Backend tests must cover at least:

- SSO login success path using mock/stub provider
- Create habit
- Create today check-in
- Prevent duplicate check-in for same habit/date
- Authorization: user cannot access another user's habits/check-ins
- WebSocket milestone notifications for 3, 7, and 30 days

Unit test pure streak logic.

Integration test API flows with Supertest.

Use test database.

Mock SSO provider responses.

Do not call Google/GitHub from tests.

Test authorization failures.

Prefer tests that verify behavior visible to users.

Avoid testing implementation details.
