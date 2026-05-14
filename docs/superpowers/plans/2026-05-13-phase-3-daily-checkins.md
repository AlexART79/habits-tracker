# Phase 3 Daily Check-ins and Streak Calculations Plan

## Summary

Implement today-only check-ins for active habits, undo for today’s check-in, per-habit streak metrics, and current-month check-in history. Reuse the existing session-owned `/api/habits` boundary, Prisma `CheckIn` table, shared package contracts, explicit React API client, and current habit dashboard/card layout.

## Key Changes

- Add shared contracts in `packages/shared`:
  - Extend `HabitResponse` with `currentStreak`, `bestStreak`, `totalCheckIns`, and `completedToday`.
  - Add `CheckInResponse`, `CheckInListResponse`, `CheckInTodayResponse`, `UndoCheckInResponse`, and a `YYYY-MM` month query shape.
- Add backend check-in API:
  - `POST /api/habits/:habitId/check-ins/today`
  - `DELETE /api/habits/:habitId/check-ins/today`
  - `GET /api/habits/:habitId/check-ins?month=YYYY-MM`
  - Backend computes today from `APP_TIMEZONE`, never accepts client-provided dates, and scopes every query by authenticated `userId`.
- Add pure streak logic in `apps/api/src/streaks`:
  - Input: unique sorted `YYYY-MM-DD` check-in dates plus backend-defined today.
  - Output: `currentStreak`, `bestStreak`, `totalCheckIns`.
  - Current streak counts consecutive dates ending today; if today is missing, current streak is `0`.
- Update `HabitsService.list/get` so habit responses include streak metrics and `completedToday`.
- Add React check-in controls:
  - Active incomplete habits show a check-in button.
  - Completed-today habits show an undo button.
  - Paused/Archived habits show disabled or explanatory non-action state.
  - Mutations refresh the habit list and preserve visible server errors.
- Add current-month history in the existing habit UI as an expandable card section, not a new route:
  - Fetch on expand with `GET /api/habits/:habitId/check-ins?month=current-month`.
  - Render checked-in dates in an accessible month grid/list.
  - Show a clear “no check-ins this month” empty state.
- Update README:
  - Mark Phase 3 as implemented.
  - Document check-in endpoints, today/timezone behavior, streak rules, and month history query.

## Implementation Order

1. Shared types and constants:
   - Update `packages/shared/src/api-types.ts`.
   - Add tests if type/runtime constants change.
2. Streak calculation:
   - Create a pure streak calculator under `apps/api/src/streaks`.
   - Unit test empty, today-only, 3/7/30-day streaks, gaps, historical best streak, and undo-today recalculation.
3. Backend check-ins:
   - Add check-in controller/service under `apps/api/src/check-ins`.
   - Validate `month=YYYY-MM`.
   - Enforce active-only check-ins, duplicate protection, owner access, and today-only undo.
4. Habit response enrichment:
   - Reuse the streak calculator when listing/reading habits.
   - Keep controllers thin; service/query layer owns ownership and metrics.
5. Frontend API and UI:
   - Add check-in functions to `apps/web/src/lib/apiClient.ts`.
   - Extend `HabitDashboard`, `HabitList`, and `HabitCard` for check-in/undo and metrics.
   - Add a focused month-history component inside `apps/web/src/features/check-ins` or `apps/web/src/features/habits`, depending on which keeps imports simpler.
6. Documentation and final verification:
   - Update README behavior docs.
   - Run from repo root:
     ```powershell
     npm run typecheck
     npm run lint
     npm test
     ```

## Test Plan

- Backend Supertest:
  - Creates today check-in for an active owned habit.
  - Duplicate today check-in returns `409`.
  - Paused and archived habits reject check-ins.
  - Another user cannot check in or undo someone else’s habit.
  - Undo today succeeds and removing it recalculates metrics.
  - Month history returns only owned habit check-ins for the requested `YYYY-MM`.
  - Invalid `month` query returns `400`.
- Backend unit tests:
  - Pure streak calculator covers no check-ins, today only, 3/7/30-day streaks, gaps, best streak, and undo-today cases.
- Frontend RTL:
  - Habit card renders current/best/total metrics.
  - Active incomplete habit can check in and refresh to undo state.
  - Completed habit can undo and refresh to check-in state.
  - Paused/Archived check-in action is unavailable or disabled with visible context.
  - Month history loading, empty, error, and checked-in-date states render.
- API client tests:
  - Check-in, undo, and month-history calls use correct endpoints, methods, credentials, and error messages.

## Assumptions

- No new runtime date library is added; implement timezone/today formatting with standard TypeScript helpers and `Intl`.
- The frontend month history is an expandable section in the existing habit card/list experience, not a separate route.
- Phase 3 does not implement search/filtering or WebSocket milestone notifications; those remain Phase 4 and Phase 5.
- Existing dark/light theme behavior is left unchanged during Phase 3 unless a specific UI bug appears.
