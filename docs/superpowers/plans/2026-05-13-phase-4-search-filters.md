# Phase 4 Search, Filters, and Responsive UI Hardening Plan

## Summary
Implement Phase 4 as a focused search/filter pass over the existing habits dashboard. The backend will support validated `GET /api/habits?search=&status=ACTIVE&completedToday=true` query params, the frontend will expose accessible filter controls with debounced live search, and the responsive polish will keep the existing dark/light theme support with dark as default while updating docs to match that decision.

## Key Changes
- Add shared habit list query types in `packages/shared`:
  - `ListHabitsRequest` with optional `search`, `status`, and `completedToday`.
  - `completedToday` is a boolean API concept serialized as query string values `true` or `false`.
- Extend `apps/api/src/habits/dto/list-habits-query.dto.ts`:
  - Validate `search` as optional trimmed string.
  - Validate `status` against centralized `HABIT_STATUSES`.
  - Transform/validate `completedToday` from `true`/`false`; reject other values with `400`.
- Update `HabitsService.list`:
  - Always scope by authenticated `userId`.
  - Search `name` and nullable `description` case-insensitively.
  - Filter by `status` when supplied.
  - When `completedToday` is supplied, filter only active habits by today’s check-in state; reject `completedToday` combined with `status=PAUSED` or `status=ARCHIVED` as `400`.
- Update frontend API client:
  - `listHabits(filters?: ListHabitsRequest)` builds `URLSearchParams`.
  - Omit empty `search` and unset filters.
- Add a small `HabitFilters` component near the habits feature:
  - Search input labeled `Search habits`.
  - Status select labeled `Status`.
  - Completed-today select labeled `Today`.
  - Clear filters button appears when any filter is active.
  - Search is debounced at 300ms; status/today changes refetch immediately.
  - Completed-today control is enabled only when status is `All` or `ACTIVE`; selecting `PAUSED`/`ARCHIVED` clears the today filter.
- Update `HabitDashboard` and `HabitList`:
  - Fetch list from backend using current filters.
  - Show normal empty state for no habits and distinct empty state for no filtered results.
  - Keep stats based on the currently returned list for this phase.
  - Preserve existing create/edit/check-in/delete behavior.
- Responsive/theme hardening:
  - Keep dark/light support and dark default.
  - Improve mobile-first spacing, wrapping, and touch targets in dashboard controls, habit cards, confirmation panels, and forms.
  - Add/keep visible hover, focus, disabled, loading, empty, and error states.
  - Update README or relevant docs where Phase 4 behavior contradicts “light theme only,” documenting that the current product keeps both themes with dark default.

## Test Plan
- Backend Supertest coverage in `apps/api/test/app.e2e-spec.ts`:
  - Search matches habit name.
  - Search matches description.
  - Status filter returns only that status.
  - `completedToday=true` returns active habits checked in today.
  - `completedToday=false` returns active habits not checked in today.
  - Invalid `completedToday` returns `400`.
  - `completedToday` with `status=PAUSED` or `ARCHIVED` returns `400`.
  - Filters never return another user’s habits.
- Frontend unit/component coverage:
  - `apiClient` serializes `search`, `status`, and `completedToday`.
  - Typing search debounces and refetches with query params.
  - Status and today filters refetch.
  - Clear filters resets controls and refetches unfiltered habits.
  - No-results filtered empty state renders separately from “No habits yet.”
  - Controls are reachable by accessible labels/roles.
- Required completion commands:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`

## Assumptions
- Use the existing explicit API hook/state pattern in `HabitDashboard`; do not introduce TanStack Query in Phase 4.
- No Playwright e2e tests are required.
- Backend remains the source of truth for “today” via existing timezone helpers.
- Search is server-side, not client-only, so filtered results remain ownership-scoped and consistent with future pagination if added later.
- Existing dark/light theme behavior stays: keep both themes, default to dark, and document that choice.
