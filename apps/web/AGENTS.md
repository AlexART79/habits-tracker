# Frontend rules

## React

- Keep server state in a query layer, for example TanStack Query or a small explicit API hook layer.
- Keep form state local to forms.
- Avoid duplicating derived state.
- Test via user-visible behavior.
- Prefer accessible controls with labels and roles.

## Component structure rules

- One file, one component. Never define multiple exported components in the same file.
- Components receive only props. Do not call API functions or import business logic directly inside a component file.
- Move all non-trivial logic (event handlers, data transformations, async operations) to custom hooks or utility files.
- Extract custom hooks (`use*.ts`) for any stateful logic that is reusable or makes a component hard to read.
- Move hardcoded string literals, class name strings, and numeric constants into a dedicated `constants.ts` file and import them.
- Inline sub-components (functions that return JSX defined inside another component file) must be extracted to their own files.

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

## Tailwind

- Mobile-first layout.
- Use consistent spacing scale.
- Add visible `hover:`, `focus:`, `disabled:` states.
- Keep repeated class groups in small reusable components.
- Support both light and dark theme.

Use mobile-first responsive design.

Use consistent spacing and typography.

Interactive controls must have visible hover and focus states.

Forms must be usable on narrow screens.

Prefer reusable components for repeated button/input/card patterns.

Avoid large unreadable class strings when a reusable component would be clearer.

## Testing

Use React Testing Library.

Frontend tests should cover:

- login screen renders Google and GitHub buttons
- habit list loading state
- no habits empty state
- create/edit validation feedback
- check-in and undo controls
- search/filter UI behavior
- notification display

Test user-visible behavior.

Test validation messages.

Test loading, error, and empty states.

No Playwright e2e UI tests required.

Prefer tests that verify behavior visible to users.

Avoid testing implementation details.
