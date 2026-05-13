# Phase 2 Habit CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Authenticated users can create, view, edit, archive, pause, resume, and delete their own habits.

**Architecture:** Reuse the Phase 1 cookie-backed session boundary. Keep habit ownership and business rules in a NestJS `habits` service, expose a thin controller under `/api/habits`, share explicit request/response types through `packages/shared`, and render the React habit experience through focused feature components using the existing explicit API client pattern.

**Tech Stack:** TypeScript strict mode, NestJS, Prisma SQLite, React, Vite, Tailwind CSS, Vitest, Supertest, React Testing Library.

---

## Implementation Tasks

- [x] Extend shared habit request/response contracts and verify shared tests.
- [x] Add backend habit DTOs, controller, service, and Supertest integration coverage.
- [x] Enforce ownership, status transitions, archived read-only behavior, and hard delete.
- [x] Add frontend habit API client functions and client tests.
- [x] Replace the placeholder protected shell controls with habit dashboard components and RTL coverage.
- [x] Update README for implemented habit endpoints, status behavior, and hard-delete cascade.
- [x] Run `npm run typecheck`, `npm run lint`, and `npm test` from the repo root.

## Decisions

- Delete behavior is hard delete; Prisma cascades remove related check-ins and milestone notifications.
- The frontend uses an in-page form panel rather than a modal.
- `PATCH` on an already archived habit returns `409`; `DELETE` remains allowed.
- Cross-user access returns `403` when the habit exists but belongs to another user; missing ids return `404`.
- No TanStack Query, Playwright, check-ins, or streak calculations are added in Phase 2.
