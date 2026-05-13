# Full UI Audit and Component Readability Refactor Plan

## Summary

Refactor the whole `apps/web/src` UI so component files become mostly presentational: one exported component per file, only props/type definitions in component files, no local helper functions, no derived business logic, and no duplicated literals. Move state orchestration into hooks, non-React helpers into utilities, and repeated labels/options/messages/classes into constants.

## Key Changes

- Split top-level shell structure:
  - `App.tsx` keeps only provider composition and the exported `App`.
  - Move auth-status rendering into a dedicated app content component.
  - Split `ProtectedShell` into header bar, shell content, auth error display, and shell actions.
- Refactor habits feature around clear boundaries:
  - `HabitDashboard` becomes a composition component.
  - Add hooks for habit list loading/mutations, filter state, form state, and confirmation state.
  - Split visual sections into dashboard header, statistics bar, filters bar, create form region, list state, card header, streak stats, check-in actions, status actions, archive confirmation, delete confirmation, and history panel.
- Move all non-component logic out of component files:
  - Date helpers such as current date/current month move to utilities.
  - Derived state such as status tone, active/paused/archive counts, disabled filter rules, query building inputs, initials, and theme labels move to hooks/helpers.
  - Component files may define their props type and render JSX only.
- Centralize literals:
  - Habit labels, empty-state copy, validation messages, filter options, button labels, aria-label builders, storage keys, debounce delay, and status metadata move to feature constants.
  - Shared UI class groups that repeat should move into reusable components or style constants when that keeps files readable.
- Preserve behavior:
  - No product redesign.
  - Keep dark/light behavior as currently implemented unless a later task explicitly changes theme policy.
  - Keep existing accessible names and visible text unless changed by constants with the same values.

## Implementation Stages

1. Audit and map current UI responsibilities
   - Produce a short `.codex` audit note listing oversized files, local functions, duplicated literals, and suggested target files.
   - Use this as the implementation checklist.

2. Extract app/auth shell structure
   - Split `AppContent` out of `App.tsx`.
   - Split `ProtectedShell` into focused components and hook/helper files.
   - Move `UserProfileCard` initials helper into an auth utility or hook.
   - Update existing auth/app tests only where imports or accessible structure change.

3. Extract habit dashboard orchestration
   - Create hooks for list fetching, debounced filters, mutations, create/edit form state, and pending confirmations.
   - Keep API calls in `lib/apiClient`.
   - Make `HabitDashboard` render composed sections using hook-returned props.

4. Split habit presentation components
   - Break `HabitCard`, `HabitList`, `HabitFilters`, `HabitForm`, and `CheckInHistory` into smaller one-component files.
   - Add feature constants for statuses, filter options, labels, messages, aria labels, debounce timing, and validation rules.
   - Add shared field/select components if needed to avoid inline event adapter functions inside feature components.

5. Test and verification cleanup
   - Keep RTL tests focused on user-visible behavior.
   - Add or adjust tests for the preserved flows: auth loading/login/shell, habit loading/empty/error states, filters, create/edit validation, check-in/undo, archive/delete confirmation, and history expansion.
   - Run required gates:
     - `npm run typecheck`
     - `npm run lint`
     - `npm test`

## Test Plan

- Existing `apps/web/src/App.test.tsx` remains the main integration-style RTL coverage for visible behavior.
- Add narrower tests only if extracted hooks/components need coverage that the app-level tests no longer exercise clearly.
- Verify no behavior regressions in:
  - login links
  - authenticated shell and logout
  - theme toggle
  - habit list states
  - search/status/today filters
  - create/edit validation and submission
  - check-in and undo
  - archive/delete confirmations
  - current month check-in history

## Assumptions

- Scope is the whole frontend UI under `apps/web/src`, not only the habits tab.
- “Only props allowed in component file” means component files may define their props type and JSX, while helpers, constants, hook logic, derived values, and event adaptation live elsewhere.
- This is a behavior-preserving refactor: no new UI features, API changes, backend changes, migrations, or README updates unless verification reveals a documented behavior has changed.
- No Playwright is required; React Testing Library plus the required root quality gates are sufficient.
