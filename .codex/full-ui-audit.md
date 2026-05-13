# Full UI Audit

## Hotspots

- `apps/web/src/App.tsx`: provider composition and auth-status rendering are mixed in one file.
- `apps/web/src/features/auth/ProtectedShell.tsx`: header layout, shell actions, auth error display, and page content are coupled.
- `apps/web/src/features/auth/UserProfileCard.tsx`: profile rendering includes initials derivation.
- `apps/web/src/features/theme/ThemeProvider.tsx`: provider component includes storage helpers and DOM theme application.
- `apps/web/src/features/habits/HabitDashboard.tsx`: list fetching, filters, form state, mutations, confirmations, statistics, and layout are all in one component.
- `apps/web/src/features/habits/HabitCard.tsx`: header, status messaging, streak stats, check-in controls, destructive confirmations, status actions, and history are mixed.
- `apps/web/src/features/habits/HabitForm.tsx`: form state, validation, date defaulting, and rendering are mixed.
- `apps/web/src/features/habits/CheckInHistory.tsx`: expansion state, API loading, current-month calculation, and rendering are mixed.

## Target Structure

- Move provider state to hooks and keep provider components as thin JSX wrappers.
- Move date, initials, theme label, status metadata, statistics, and aria-label builders to utilities/constants.
- Split habit dashboard into header, statistics, filters, form region, list state, card sections, confirmations, actions, and history panel.
- Keep RTL coverage centered on user-visible behavior in `App.test.tsx`.
