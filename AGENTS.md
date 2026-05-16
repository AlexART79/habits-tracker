# Best-practice rules for this project

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

## TypeScript

- Use `strict: true`.
- Avoid `any`.
- Prefer explicit API response types.
- Keep domain enums centralized.
- Do not duplicate magic strings for statuses, milestones, or WebSocket events.

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
- User can check in today and undo today's check-in.
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
