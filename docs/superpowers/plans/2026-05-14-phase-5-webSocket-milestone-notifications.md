# Phase 5 WebSocket Milestone Notifications Plan

## Summary

Build Phase 5 with **raw WebSocket** transport and the documented JSON message contract. The backend will authenticate the WebSocket upgrade with the existing `habit_tracker_session` cookie, evaluate 3/7/30-day milestones on connection open, emit only after `milestones.subscribe`, persist each milestone once, and acknowledge notifications when the user dismisses them.

## Key Changes

- Add a raw WebSocket notification server under `apps/api/src/notifications` using `ws`, sharing the existing Express session middleware from `app.setup.ts`.
- Add shared notification types to `packages/shared/src/api-types.ts` and reuse existing `WEBSOCKET_EVENTS` and `MILESTONE_DAYS`.
- Implement `NotificationsService` to:
  - load active owned habits and check-ins,
  - calculate current streak with existing streak logic,
  - create missing `MilestoneNotification` rows for reached 3/7/30 milestones,
  - ignore already-created `habitId + milestone` records,
  - set `acknowledgedAt` for owned notification IDs only.
- Add frontend notification feature under `apps/web/src/features/notifications`:
  - connect after auth inside `ProtectedShell`,
  - send `milestones.subscribe` with `clientTime`,
  - render visible milestone banners/list items,
  - send `notification.ack` only when dismissed.

## Test Plan

- Backend integration tests:
  - unauthenticated WebSocket upgrade is rejected,
  - authenticated socket connects through test-login session cookie,
  - subscribe emits 3, 7, and 30-day milestone messages,
  - unreached milestones are not emitted,
  - reconnect does not resend stored milestones,
  - another user’s milestones are never emitted,
  - `notification.ack` updates only owned notifications.
- Frontend RTL tests:
  - authenticated shell opens WebSocket and sends `milestones.subscribe`,
  - `milestone.reached` renders visible notification text,
  - dismiss sends `notification.ack` and removes the notification,
  - socket setup is skipped while unauthenticated.
- Final gates:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`

## Assumptions

- Add direct dependencies where needed: `ws` plus `@types/ws` for API tests/types.
- Keep the current dark-default UI behavior; Phase 5 adds notification UI without theme rewrites.
- README only needs Phase 5 sections updated to describe the implemented WebSocket URL, message contract, once-per-milestone behavior, and ack-on-dismiss behavior.
