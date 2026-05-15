# Best-practice rules for this project

## TypeScript

- Use `strict: true`.
- Avoid `any`.
- Prefer explicit API response types.
- Keep domain enums centralized.
- Do not duplicate magic strings for statuses, milestones, or WebSocket events.

## NestJS

- Organize by feature module:
  - `auth`
  - `users`
  - `habits`
  - `check-ins`
  - `streaks`
  - `notifications`

- Controllers should be thin.
- Business rules belong in services.
- Use guards for authentication.
- Always enforce ownership in service/query layer.
- Use global validation pipe:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`

- Return clear `400`, `401`, `403`, `404`, and `409` errors.
- Never trust client-provided `userId`.

## React

- Keep server state in a query layer, for example TanStack Query or a small explicit API hook layer.
- Keep form state local to forms.
- Avoid duplicating derived state.
- Test via user-visible behavior.
- Prefer accessible controls with labels and roles.

## Tailwind

- Mobile-first layout.
- Use consistent spacing scale.
- Add visible `hover:`, `focus:`, `disabled:` states.
- Keep repeated class groups in small reusable components.
- Support both light and dark theme.

## Testing

Backend:

- Unit test pure streak logic.
- Integration test API flows with Supertest.
- Use test database.
- Mock SSO provider responses.
- Do not call Google/GitHub from tests.
- Test authorization failures.

Frontend:

- Use React Testing Library.
- Test user-visible behavior.
- Test validation messages.
- Test loading, error, and empty states.
- No Playwright e2e UI tests required.

## Project

Habit Tracker with Streaks.

This is a full-stack TypeScript app:

- Backend: NestJS
- Frontend: React + Vite
- Styling: Tailwind CSS
- Database: SQLite via Prisma
- Auth: Google OAuth/OIDC and GitHub OAuth
- Realtime: WebSocket milestone notifications
- Tests: backend unit/integration tests and frontend component tests
- No Playwright e2e tests are required

The app must run locally.
URLs:

- Frontend: http://localhost:5175/
- Backend: http://localhost:3002/

## Non-negotiable rules

Before considering any task complete, run and pass:

npm run typecheck
npm run lint -- --fix
npm test

_running 'npm run lint -- --fix' to fix all autofixable errors will save a lot of time and tokens_

Do not mark work as complete if typecheck, lint, or tests fail.

Every story/change must include relevant automated tests.

User inputs must be validated both where appropriate on the client and always on the server.

Never trust client-provided userId.

Every habit, check-in, and notification operation must be scoped to the authenticated user.

Tests must not call real Google or GitHub services.

## Windows and PowerShell rules

The primary developer environment is Windows with PowerShell.

When suggesting or running terminal commands:

- Prefer PowerShell-compatible commands.
- Do not assume Bash, Zsh, sed, awk, grep, cat, rm -rf, cp, mv, export, or heredocs are available.
- Prefer separate commands instead of Bash chains.
- Avoid Bash-specific syntax like:
  - export NAME=value
  - VAR=value command
  - rm -rf
  - cp -r
  - cat <<EOF
  - sed -i
  - grep
- Use PowerShell equivalents when needed:
  - Set env var for current session: $env:NAME = "value"
  - Remove folder: Remove-Item -Recurse -Force .\path
  - Create folder: New-Item -ItemType Directory -Force .\path
  - Copy item: Copy-Item .\source .\dest -Recurse
  - Read file: Get-Content .\file.txt
  - Write file: Set-Content .\file.txt "content"
- If a command is cross-platform through npm scripts, prefer the npm script.

Good examples:

npm install
npm run dev
npm run typecheck
npm run lint
npm test

PowerShell env var example:

$env:DATABASE_URL = "file:./dev.db"
npm run prisma:migrate -w apps/api

## Development workflow

1. Read the relevant spec/README section first.
2. Make the smallest coherent change.
3. Add or update tests for the change.
4. Run typecheck, lint, and tests.
5. Update README if behavior, setup, env vars, API, WebSocket contract, timezone handling, or deletion behavior changes.

Do not perform broad rewrites unless explicitly requested.

Do not introduce new frameworks or libraries without a clear reason.

Do not remove existing tests unless they are obsolete and replaced by better coverage.

## Backend rules: NestJS

Use feature modules:

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

Use guards for authenticated HTTP routes.

Use authenticated WebSocket handshake/session validation.

Use clear HTTP errors:

- 400 for validation/business input errors
- 401 for unauthenticated requests
- 403 for cross-user access attempts
- 404 when an owned resource does not exist
- 409 for duplicate check-ins or unique constraint conflicts

Do not expose internal stack traces in API responses.

## Database rules

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

## Auth rules

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
- User can undo today’s check-in.
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
- Removing today’s check-in must recalculate current streak.

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

Never send one user’s notifications to another user.

## Frontend rules: React

Use TypeScript.

Prefer small components.

Keep API calls in a dedicated API client layer.

Use accessible forms and controls.

Use labels for inputs.

Use buttons for actions.

Show visible states:

- loading
- error
- empty state
- validation feedback
- disabled/submitting state

Do not hide server errors.

Do not rely only on color to communicate important status.

## Tailwind rules

Use light theme only.

Use mobile-first responsive design.

Use consistent spacing and typography.

Interactive controls must have visible hover and focus states.

Forms must be usable on narrow screens.

Prefer reusable components for repeated button/input/card patterns.

Avoid large unreadable class strings when a reusable component would be clearer.

## Testing rules

Backend tests must cover at least:

- SSO login success path using mock/stub provider
- Create habit
- Create today check-in
- Prevent duplicate check-in for same habit/date
- Authorization: user cannot access another user’s habits/check-ins
- WebSocket milestone notifications for 3, 7, and 30 days

Frontend tests should cover:

- login screen renders Google and GitHub buttons
- habit list loading state
- no habits empty state
- create/edit validation feedback
- check-in and undo controls
- search/filter UI behavior
- notification display

Prefer tests that verify behavior visible to users.

Avoid testing implementation details.

## README requirements

README must include:

- how to run backend locally
- how to run frontend locally
- how to run tests
- database setup and migration commands
- required environment variables
- Google OAuth setup
- GitHub OAuth setup
- short API description
- WebSocket message format
- milestone notification rules
- streak calculation notes
- timezone handling
- habit deletion behavior
- Docker note, even if Docker is skipped

## Completion checklist

Before finishing the project, verify:

- User can sign in with Google.
- User can sign in with GitHub.
- Local user record is created on first SSO sign-in.
- User can create, edit, and delete habits.
- User can check in today and undo today’s check-in.
- Current streak is shown.
- Best streak is shown.
- Total check-ins are shown.
- User can search habits.
- User can filter habits.
- Cross-account data access is blocked.
- WebSocket sends 3-day milestone notification.
- WebSocket sends 7-day milestone notification.
- WebSocket sends 30-day milestone notification.
- Milestone notification is not repeated on reconnect.
- Client sends meaningful WebSocket message.
- App runs locally from README commands.
- Tests pass locally.

```

[1]: https://docs.nestjs.com/recipes/passport "passport | NestJS - A progressive Node.js framework"
[2]: https://www.prisma.io/docs/orm/core-concepts/supported-databases/sqlite "SQLite database connector | Prisma Documentation"
[3]: https://react.dev/learn/managing-state "Managing State – React"
```
