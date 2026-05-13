# Phase 0 Project Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable full-stack TypeScript monorepo foundation with a minimal NestJS API, React/Vite UI, Tailwind shell, Prisma SQLite schema, and passing typecheck/lint/test scripts.

**Architecture:** Use npm workspaces with `apps/api` for NestJS, `apps/web` for React/Vite, and `packages/shared` for shared constants and response/event types. Keep backend feature folders aligned with `AGENTS.md` even when modules are initially thin, and keep frontend API calls in a small explicit query/client layer from day one.

**Tech Stack:** TypeScript strict mode, NestJS, React, Vite, Tailwind CSS, Prisma SQLite, Vitest, React Testing Library, Supertest, ESLint, Prettier.

---

## Phase 0 Scope

This plan implements only Phase 0 from `docs/phased-development-plan.md`:

- A runnable monorepo skeleton.
- Minimal backend health endpoint.
- Minimal frontend shell that calls the backend health endpoint.
- Tailwind light-theme layout primitives.
- Prisma SQLite schema and service/module.
- Test, lint, and typecheck infrastructure.

Authentication, real habit CRUD, check-ins, streak behavior, OAuth, and WebSocket notifications are intentionally deferred to later phases. Phase 0 still creates empty feature directories where useful so later phases land in the agreed structure.

## File Structure

Create or modify these files:

- `package.json` - root npm workspace scripts for dev, typecheck, lint, test, format, and Prisma helper commands.
- `tsconfig.base.json` - shared strict TypeScript compiler settings and path alias for `@habit-tracker/shared`.
- `.prettierrc` - shared formatting rules.
- `.eslintrc.cjs` - root ESLint config for TypeScript, React, and Node files.
- `README.md` - Phase 0 local setup, run, test, database, env, OAuth placeholders, API, WebSocket, timezone, deletion, and Docker note.
- `packages/shared/package.json` - shared workspace package metadata.
- `packages/shared/tsconfig.json` - shared package strict TypeScript config.
- `packages/shared/src/constants.ts` - centralized habit statuses, WebSocket event names, milestone values, and default timezone.
- `packages/shared/src/api-types.ts` - explicit API response types, starting with health response.
- `packages/shared/src/index.ts` - shared exports.
- `packages/shared/src/constants.test.ts` - shared constants smoke tests.
- `apps/api/package.json` - backend scripts and dependencies.
- `apps/api/tsconfig.json` - Nest-compatible strict TypeScript config.
- `apps/api/tsconfig.build.json` - backend build config excluding tests.
- `apps/api/vitest.config.ts` - Vitest config for unit/integration tests.
- `apps/api/src/main.ts` - Nest bootstrap with global validation pipe and CORS.
- `apps/api/src/app.module.ts` - root module importing feature skeletons, health, and Prisma.
- `apps/api/src/health/health.controller.ts` - thin health controller.
- `apps/api/src/health/health.module.ts` - health module.
- `apps/api/src/prisma/prisma.module.ts` - global Prisma module.
- `apps/api/src/prisma/prisma.service.ts` - Prisma lifecycle wrapper.
- `apps/api/src/auth/auth.module.ts` - empty Phase 0 auth module placeholder.
- `apps/api/src/users/users.module.ts` - empty Phase 0 users module placeholder.
- `apps/api/src/habits/habits.module.ts` - empty Phase 0 habits module placeholder.
- `apps/api/src/check-ins/check-ins.module.ts` - empty Phase 0 check-ins module placeholder.
- `apps/api/src/streaks/streaks.module.ts` - empty Phase 0 streaks module placeholder.
- `apps/api/src/notifications/notifications.module.ts` - empty Phase 0 notifications module placeholder.
- `apps/api/src/health/health.controller.spec.ts` - backend controller unit test.
- `apps/api/src/prisma/prisma.service.spec.ts` - Prisma service initialization test.
- `apps/api/test/app.e2e-spec.ts` - Supertest health integration test.
- `apps/api/test/database.ts` - reusable test database cleanup helper.
- `apps/api/prisma/schema.prisma` - SQLite schema for `User`, `Habit`, `CheckIn`, and `MilestoneNotification`.
- `apps/api/.env.example` - backend environment example.
- `apps/web/package.json` - frontend scripts and dependencies.
- `apps/web/tsconfig.json` - strict frontend TypeScript config.
- `apps/web/tsconfig.node.json` - strict config for Vite/Vitest config files.
- `apps/web/vite.config.ts` - Vite React config with `/api` proxy.
- `apps/web/index.html` - app entry HTML.
- `apps/web/postcss.config.cjs` - PostCSS config for Tailwind.
- `apps/web/tailwind.config.ts` - Tailwind content/theme config.
- `apps/web/src/main.tsx` - React root bootstrap.
- `apps/web/src/App.tsx` - basic app shell.
- `apps/web/src/index.css` - Tailwind layers and reusable component classes.
- `apps/web/src/lib/apiClient.ts` - frontend health API client.
- `apps/web/src/components/Button.tsx` - reusable accessible button.
- `apps/web/src/components/Card.tsx` - reusable card wrapper.
- `apps/web/src/components/Input.tsx` - reusable accessible input.
- `apps/web/src/test/setup.ts` - React Testing Library setup.
- `apps/web/src/App.test.tsx` - frontend shell behavior tests.
- `apps/web/src/lib/apiClient.test.ts` - API client tests.

## Implementation Notes

- Use npm workspaces only; do not add pnpm, Yarn, Turborepo, Nx, or new frameworks.
- Use light theme only in Phase 0, matching this repo’s `AGENTS.md`.
- Use PowerShell-compatible commands in docs and execution notes.
- Use `npm install` from the repo root after package files are created.
- Use Prisma migrations for schema changes. Do not manually edit generated Prisma client files.
- The backend listens on `http://localhost:3001` and the frontend on `http://localhost:5174`.
- The frontend calls `/api/health`; Vite proxies `/api` to `http://localhost:3001` during local development.
- Backend routes are mounted at `/api`, so the health endpoint is `GET /api/health`.

---

### Task 1: Root Workspace and Shared Package

**Files:**

- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.prettierrc`
- Create: `.eslintrc.cjs`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/api-types.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/constants.test.ts`

- [ ] **Step 1: Create root workspace package metadata**

Create `package.json`:

```json
{
  "name": "habit-tracker",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "typecheck": "npm run typecheck -w packages/shared && npm run typecheck -w apps/api && npm run typecheck -w apps/web",
    "lint": "eslint . --ext .ts,.tsx,.js,.cjs",
    "test": "npm test -w packages/shared && npm test -w apps/api && npm test -w apps/web",
    "format": "prettier --write .",
    "prisma:generate": "npm run prisma:generate -w apps/api",
    "prisma:migrate": "npm run prisma:migrate -w apps/api"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "concurrently": "^8.2.2",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.9",
    "prettier": "^3.3.3",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create shared strict TypeScript config**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@habit-tracker/shared": ["packages/shared/src/index.ts"]
    }
  }
}
```

- [ ] **Step 3: Create formatting and lint configuration**

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

Create `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: [
    'dist',
    'coverage',
    'node_modules',
    'apps/api/generated',
    'apps/api/prisma/migrations',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
```

- [ ] **Step 4: Create shared package**

Create `packages/shared/package.json`:

```json
{
  "name": "@habit-tracker/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["vitest/globals"],
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Add centralized domain constants and API types**

Create `packages/shared/src/constants.ts`:

```typescript
export const HABIT_STATUSES = ['ACTIVE', 'PAUSED', 'ARCHIVED'] as const;

export type HabitStatus = (typeof HABIT_STATUSES)[number];

export const MILESTONE_DAYS = [3, 7, 30] as const;

export type MilestoneDay = (typeof MILESTONE_DAYS)[number];

export const DEFAULT_APP_TIMEZONE = 'UTC';

export const WEBSOCKET_EVENTS = {
  milestonesSubscribe: 'milestones.subscribe',
  milestoneReached: 'milestone.reached',
  notificationAck: 'notification.ack',
} as const;

export type WebSocketEventName = (typeof WEBSOCKET_EVENTS)[keyof typeof WEBSOCKET_EVENTS];
```

Create `packages/shared/src/api-types.ts`:

```typescript
export type HealthResponse = {
  status: 'ok';
  service: 'habit-tracker-api';
  timestamp: string;
};
```

Create `packages/shared/src/index.ts`:

```typescript
export * from './api-types';
export * from './constants';
```

- [ ] **Step 6: Add shared package test**

Create `packages/shared/src/constants.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APP_TIMEZONE,
  HABIT_STATUSES,
  MILESTONE_DAYS,
  WEBSOCKET_EVENTS,
} from './constants';

describe('shared constants', () => {
  it('centralizes habit statuses and milestone values', () => {
    expect(HABIT_STATUSES).toEqual(['ACTIVE', 'PAUSED', 'ARCHIVED']);
    expect(MILESTONE_DAYS).toEqual([3, 7, 30]);
  });

  it('defines the Phase 0 default timezone and WebSocket event names', () => {
    expect(DEFAULT_APP_TIMEZONE).toBe('UTC');
    expect(WEBSOCKET_EVENTS.milestonesSubscribe).toBe('milestones.subscribe');
    expect(WEBSOCKET_EVENTS.milestoneReached).toBe('milestone.reached');
    expect(WEBSOCKET_EVENTS.notificationAck).toBe('notification.ack');
  });
});
```

- [ ] **Step 7: Install dependencies**

Run:

```powershell
npm install
```

Expected: `package-lock.json` is created and npm reports installed packages without audit blocking the install.

- [ ] **Step 8: Verify shared package**

Run:

```powershell
npm run typecheck -w packages/shared
```

Expected: TypeScript exits successfully.

Run:

```powershell
npm test -w packages/shared
```

Expected: Vitest reports `2 passed`.

- [ ] **Step 9: Commit root workspace**

Run:

```powershell
git add package.json package-lock.json tsconfig.base.json .prettierrc .eslintrc.cjs packages/shared
git commit -m "chore: initialize workspace foundation"
```

Expected: Commit succeeds with the root workspace and shared package.

---

### Task 2: Backend NestJS Health API

**Files:**

- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.module.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/habits/habits.module.ts`
- Create: `apps/api/src/check-ins/check-ins.module.ts`
- Create: `apps/api/src/streaks/streaks.module.ts`
- Create: `apps/api/src/notifications/notifications.module.ts`
- Create: `apps/api/src/health/health.controller.spec.ts`
- Create: `apps/api/test/app.e2e-spec.ts`

- [ ] **Step 1: Create backend package metadata**

Create `apps/api/package.json`:

```json
{
  "name": "@habit-tracker/api",
  "version": "0.1.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@habit-tracker/shared": "0.1.0",
    "@nestjs/common": "^10.4.1",
    "@nestjs/core": "^10.4.1",
    "@nestjs/platform-express": "^10.4.1",
    "@prisma/client": "^5.18.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.5",
    "@nestjs/testing": "^10.4.1",
    "@types/express": "^4.17.21",
    "@types/node": "^22.5.0",
    "@types/supertest": "^6.0.2",
    "prisma": "^5.18.0",
    "supertest": "^7.0.0",
    "typescript": "^5.5.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Add backend TypeScript and Vitest config**

Create `apps/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["node", "vitest/globals"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

Create `apps/api/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src"
  },
  "exclude": ["src/**/*.spec.ts", "test/**/*.ts"]
}
```

Create `apps/api/nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

Create `apps/api/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});
```

- [ ] **Step 3: Write failing backend health tests**

Create `apps/api/src/health/health.controller.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an explicit health response', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const response = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('habit-tracker-api');
    expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
  });
});
```

Create `apps/api/test/app.e2e-spec.ts`:

```typescript
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('App health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 from GET /api/health', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'habit-tracker-api',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail before implementation**

Run:

```powershell
npm install
```

Expected: backend dependencies are installed.

Run:

```powershell
npm test -w apps/api
```

Expected: FAIL because `apps/api/src/health/health.controller.ts` and `apps/api/src/app.module.ts` do not exist yet.

- [ ] **Step 5: Implement minimal NestJS modules and health controller**

Create `apps/api/src/main.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5174',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
```

Create `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { HabitsModule } from './habits/habits.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StreaksModule } from './streaks/streaks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    CheckInsModule,
    StreaksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

Create `apps/api/src/health/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@habit-tracker/shared';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'habit-tracker-api',
      timestamp: new Date().toISOString(),
    };
  }
}
```

Create `apps/api/src/health/health.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

Create `apps/api/src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class AuthModule {}
```

Create `apps/api/src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class UsersModule {}
```

Create `apps/api/src/habits/habits.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class HabitsModule {}
```

Create `apps/api/src/check-ins/check-ins.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class CheckInsModule {}
```

Create `apps/api/src/streaks/streaks.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class StreaksModule {}
```

Create `apps/api/src/notifications/notifications.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class NotificationsModule {}
```

- [ ] **Step 6: Verify backend health tests pass**

Run:

```powershell
npm test -w apps/api
```

Expected: Vitest reports the health controller and `GET /api/health` tests passing.

Run:

```powershell
npm run typecheck -w apps/api
```

Expected: TypeScript exits successfully.

- [ ] **Step 7: Commit backend health API**

Run:

```powershell
git add apps/api package.json package-lock.json
git commit -m "feat(api): add health endpoint skeleton"
```

Expected: Commit succeeds with the backend skeleton.

---

### Task 3: Prisma SQLite Foundation

**Files:**

- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.service.spec.ts`
- Create: `apps/api/test/database.ts`
- Create: `apps/api/.env.example`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Add Prisma schema for required Phase 0 data model**

Create `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  provider       String
  providerUserId String
  email          String?
  displayName    String
  avatarUrl      String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  habits         Habit[]
  checkIns       CheckIn[]
  notifications  MilestoneNotification[]

  @@unique([provider, providerUserId])
}

model Habit {
  id            String    @id @default(cuid())
  userId        String
  name          String
  description   String?
  startDate     String
  status        HabitStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIns      CheckIn[]
  notifications MilestoneNotification[]

  @@index([userId])
}

model CheckIn {
  id        String   @id @default(cuid())
  habitId   String
  userId    String
  date      String
  createdAt DateTime @default(now())
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([userId])
}

model MilestoneNotification {
  id             String    @id @default(cuid())
  userId         String
  habitId        String
  milestone      Int
  sentAt         DateTime  @default(now())
  acknowledgedAt DateTime?
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  habit          Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, milestone])
  @@index([userId])
}

enum HabitStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}
```

Create `apps/api/.env.example`:

```text
PORT=3001
WEB_ORIGIN=http://localhost:5174
DATABASE_URL=file:./dev.db
APP_TIMEZONE=UTC
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

- [ ] **Step 2: Generate Prisma client**

Run:

```powershell
npm run prisma:generate -w apps/api
```

Expected: Prisma generates `@prisma/client` without schema errors.

- [ ] **Step 3: Write failing Prisma service tests**

Create `apps/api/src/prisma/prisma.service.spec.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('can connect and disconnect using Prisma lifecycle hooks', async () => {
    const service = new PrismaService();

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
```

Create `apps/api/test/database.ts`:

```typescript
import type { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.milestoneNotification.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();
}
```

- [ ] **Step 4: Run Prisma service test to verify it fails before service exists**

Run:

```powershell
npm test -w apps/api -- --run src/prisma/prisma.service.spec.ts
```

Expected: FAIL because `apps/api/src/prisma/prisma.service.ts` does not exist yet.

- [ ] **Step 5: Implement Prisma module and service**

Create `apps/api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

Create `apps/api/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Modify `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { HabitsModule } from './habits/habits.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { StreaksModule } from './streaks/streaks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    CheckInsModule,
    StreaksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Run local migration**

Run:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Expected: `.env` exists for local development. Keep `.env` untracked.

Run:

```powershell
npm run prisma:migrate -w apps/api -- --name init
```

Expected: Prisma creates `apps/api/prisma/migrations/<timestamp>_init` and `apps/api/prisma/dev.db`.

- [ ] **Step 7: Verify Prisma service and backend tests**

Run:

```powershell
npm test -w apps/api
```

Expected: backend unit and integration tests pass.

Run:

```powershell
npm run typecheck -w apps/api
```

Expected: TypeScript exits successfully.

- [ ] **Step 8: Commit Prisma foundation**

Run:

```powershell
git add apps/api/prisma apps/api/src/prisma apps/api/test/database.ts apps/api/src/app.module.ts apps/api/.env.example package.json package-lock.json
git commit -m "feat(api): add prisma sqlite foundation"
```

Expected: Commit succeeds with schema, migration, Prisma module, and tests. Do not add `apps/api/.env` or `apps/api/prisma/dev.db`.

---

### Task 4: Frontend Vite React Shell and API Client

**Files:**

- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/lib/apiClient.ts`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/src/App.test.tsx`
- Create: `apps/web/src/lib/apiClient.test.ts`

- [ ] **Step 1: Create frontend package metadata**

Create `apps/web/package.json`:

```json
{
  "name": "@habit-tracker/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.node.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@habit-tracker/shared": "0.1.0",
    "@vitejs/plugin-react": "^4.3.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.5.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Add frontend TypeScript and Vite config**

Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "vitest/globals"],
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

Create `apps/web/tsconfig.node.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"],
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
```

Create `apps/web/vite.config.ts`:

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

Create `apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Habit Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write failing frontend API and shell tests**

Create `apps/web/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

Create `apps/web/src/lib/apiClient.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from './apiClient';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the backend health endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'habit-tracker-api',
          timestamp: '2026-05-12T00:00:00.000Z',
        }),
      }),
    );

    await expect(getHealth()).resolves.toEqual({
      status: 'ok',
      service: 'habit-tracker-api',
      timestamp: '2026-05-12T00:00:00.000Z',
    });
    expect(fetch).toHaveBeenCalledWith('/api/health');
  });

  it('throws a visible error when health request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(getHealth()).rejects.toThrow('Backend health check failed.');
  });
});
```

Create `apps/web/src/App.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the Phase 0 shell with accessible controls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'habit-tracker-api',
          timestamp: '2026-05-12T00:00:00.000Z',
        }),
      }),
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Habit Tracker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create first habit' })).toBeDisabled();
    expect(screen.getByLabelText('Search habits')).toBeInTheDocument();
    expect(screen.getByText('Checking backend connection...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('API connected')).toBeInTheDocument();
    });
  });

  it('shows backend connection errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Backend health check failed.');
    });
  });
});
```

- [ ] **Step 4: Run frontend tests to verify they fail before implementation**

Run:

```powershell
npm install
```

Expected: frontend dependencies are installed.

Run:

```powershell
npm test -w apps/web
```

Expected: FAIL because `apps/web/src/App.tsx` and `apps/web/src/lib/apiClient.ts` do not exist yet.

- [ ] **Step 5: Implement frontend API client and shell**

Create `apps/web/src/lib/apiClient.ts`:

```typescript
import type { HealthResponse } from '@habit-tracker/shared';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health');

  if (!response.ok) {
    throw new Error('Backend health check failed.');
  }

  return response.json() as Promise<HealthResponse>;
}
```

Create `apps/web/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { HealthResponse } from '@habit-tracker/shared';
import { getHealth } from './lib/apiClient';

type HealthState =
  | { status: 'loading' }
  | { status: 'connected'; data: HealthResponse }
  | { status: 'error'; message: string };

export default function App(): JSX.Element {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth({ status: 'connected', data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealth({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to reach the backend.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Habit Tracker with Streaks
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          </div>
          <div aria-live="polite" className="text-sm font-medium">
            {health.status === 'loading' ? (
              <span className="text-slate-600">Checking backend connection...</span>
            ) : null}
            {health.status === 'connected' ? (
              <span className="text-emerald-700">API connected</span>
            ) : null}
            {health.status === 'error' ? (
              <span role="alert" className="text-red-700">
                {health.message}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold">Your habits</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Phase 0 proves the app shell, styling, and API connection. Habit management starts
                in Phase 2.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              Create first habit
            </button>
          </div>

          <div className="mt-6">
            <label htmlFor="habit-search" className="block text-sm font-medium text-slate-800">
              Search habits
            </label>
            <input
              id="habit-search"
              type="search"
              disabled
              className="mt-2 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 shadow-sm disabled:cursor-not-allowed"
              placeholder="Available in Phase 4"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
```

Create `apps/web/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `apps/web/src/index.css`:

```css
body {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
```

- [ ] **Step 6: Verify frontend tests and typecheck pass**

Run:

```powershell
npm test -w apps/web
```

Expected: Vitest reports API client and shell tests passing.

Run:

```powershell
npm run typecheck -w apps/web
```

Expected: TypeScript exits successfully.

- [ ] **Step 7: Commit frontend shell**

Run:

```powershell
git add apps/web package.json package-lock.json
git commit -m "feat(web): add react app shell"
```

Expected: Commit succeeds with frontend skeleton and tests.

---

### Task 5: Tailwind and Reusable UI Primitives

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/postcss.config.cjs`
- Create: `apps/web/tailwind.config.ts`
- Modify: `apps/web/src/index.css`
- Create: `apps/web/src/components/Button.tsx`
- Create: `apps/web/src/components/Card.tsx`
- Create: `apps/web/src/components/Input.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Add Tailwind dependencies**

Modify `apps/web/package.json` dev dependencies to include:

```json
{
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10"
  }
}
```

Keep the existing frontend dependencies and dev dependencies from Task 4.

Run:

```powershell
npm install
```

Expected: Tailwind, PostCSS, and Autoprefixer are installed.

- [ ] **Step 2: Add Tailwind configuration**

Create `apps/web/postcss.config.cjs`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `apps/web/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

Modify `apps/web/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    margin: 0;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }

  :focus-visible {
    outline: 3px solid rgb(5 150 105);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 3: Create reusable UI primitives**

Create `apps/web/src/components/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

const variantClasses = {
  primary:
    'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700 disabled:bg-slate-300 disabled:text-slate-600',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-emerald-700 disabled:bg-slate-100 disabled:text-slate-500',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={[
        'inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
```

Create `apps/web/src/components/Card.tsx`:

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className = '', ...props }: CardProps): JSX.Element {
  return (
    <section
      className={['rounded-lg border border-slate-200 bg-white p-5 shadow-sm', className].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}
```

Create `apps/web/src/components/Input.tsx`:

```tsx
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ id, label, className = '', ...props }: InputProps): JSX.Element {
  const inputId = id ?? props.name;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          'mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 4: Update app shell to use primitives**

Modify `apps/web/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { HealthResponse } from '@habit-tracker/shared';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { getHealth } from './lib/apiClient';

type HealthState =
  | { status: 'loading' }
  | { status: 'connected'; data: HealthResponse }
  | { status: 'error'; message: string };

export default function App(): JSX.Element {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth({ status: 'connected', data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealth({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unable to reach the backend.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Habit Tracker with Streaks
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          </div>
          <div aria-live="polite" className="text-sm font-medium">
            {health.status === 'loading' ? (
              <span className="text-slate-600">Checking backend connection...</span>
            ) : null}
            {health.status === 'connected' ? (
              <span className="text-emerald-700">API connected</span>
            ) : null}
            {health.status === 'error' ? (
              <span role="alert" className="text-red-700">
                {health.message}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold">Your habits</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Phase 0 proves the app shell, styling, and API connection. Habit management starts
                in Phase 2.
              </p>
            </div>
            <Button type="button" disabled>
              Create first habit
            </Button>
          </div>

          <div className="mt-6">
            <Input
              id="habit-search"
              label="Search habits"
              type="search"
              disabled
              placeholder="Available in Phase 4"
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Verify frontend shell behavior still passes**

Run:

```powershell
npm test -w apps/web
```

Expected: frontend tests pass.

Run:

```powershell
npm run typecheck -w apps/web
```

Expected: TypeScript exits successfully.

Run:

```powershell
npm run build -w apps/web
```

Expected: Vite builds production assets successfully.

- [ ] **Step 6: Commit Tailwind shell**

Run:

```powershell
git add apps/web package.json package-lock.json
git commit -m "feat(web): add tailwind design shell"
```

Expected: Commit succeeds with Tailwind and reusable UI primitives.

---

### Task 6: README Phase 0 Documentation

**Files:**

- Create or modify: `README.md`

- [ ] **Step 1: Write README with accurate Phase 0 instructions**

Create or replace `README.md`:

````markdown
# Habit Tracker with Streaks

Full-stack TypeScript habit tracker built with NestJS, React, Vite, Tailwind CSS, Prisma, and SQLite.

## Current Status

Phase 0 is the local project foundation:

- NestJS API with `GET /api/health`
- React/Vite web shell
- Tailwind light-theme styling
- Prisma SQLite schema
- npm workspace scripts for typecheck, lint, and tests

Authentication, habit CRUD, check-ins, streaks, search, filters, and WebSocket milestone notifications are planned in later phases.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PowerShell on Windows

## Install

```powershell
npm install
```
````

## Environment

Copy the backend example environment file:

```powershell
Copy-Item .\apps\api\.env.example .\apps\api\.env
```

Default local values:

```text
PORT=3001
WEB_ORIGIN=http://localhost:5174
DATABASE_URL=file:./dev.db
APP_TIMEZONE=UTC
```

OAuth variables are present for later phases:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

## Database Setup

Generate Prisma client:

```powershell
npm run prisma:generate -w apps/api
```

Create or update the local SQLite database:

```powershell
npm run prisma:migrate -w apps/api
```

The local database uses `apps/api/prisma/dev.db` when `DATABASE_URL=file:./dev.db`.

## Run Locally

Start both apps:

```powershell
npm run dev
```

API:

```text
http://localhost:3001/api
```

Web:

```text
http://localhost:5174
```

Health endpoint:

```text
GET http://localhost:3001/api/health
```

## Quality Commands

Run typecheck:

```powershell
npm run typecheck
```

Run lint:

```powershell
npm run lint
```

Run tests:

```powershell
npm test
```

Every phase must pass all three commands before it is complete.

## API Summary

Phase 0:

```text
GET /api/health
```

Later phases add:

```text
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/github
GET  /api/auth/github/callback
GET  /api/auth/me
POST /api/auth/logout
GET  /api/habits
POST /api/habits
GET  /api/habits/:id
PATCH /api/habits/:id
DELETE /api/habits/:id
POST /api/habits/:habitId/check-ins/today
DELETE /api/habits/:habitId/check-ins/today
GET  /api/habits/:habitId/check-ins?month=YYYY-MM
```

## WebSocket Message Format

WebSocket milestone notifications are planned for Phase 5. The intended client-to-server events are:

```json
{
  "type": "milestones.subscribe",
  "payload": {
    "clientTime": "2026-05-12T12:00:00.000Z"
  }
}
```

```json
{
  "type": "notification.ack",
  "payload": {
    "notificationId": "notification-id"
  }
}
```

The intended server-to-client event is:

```json
{
  "type": "milestone.reached",
  "payload": {
    "notificationId": "notification-id",
    "habitId": "habit-id",
    "habitName": "Read",
    "milestone": 7,
    "currentStreak": 7
  }
}
```

## Milestone Notification Rules

Milestone notifications are planned for 3, 7, and 30 day streaks. A notification must be sent once per habit per milestone and must not repeat on reconnect after it is stored.

## Streak Calculation Notes

Streak calculation is planned for Phase 3. Streaks are based on consecutive calendar dates, using backend-defined today.

## Timezone Handling

The app uses `APP_TIMEZONE` to define calendar-day boundaries. The default is `UTC`. Check-in dates are stored as `YYYY-MM-DD` calendar dates.

## Habit Deletion Behavior

The planned MVP deletion behavior is hard delete. Deleting a habit cascades to its check-in history and milestone notifications.

## Google OAuth Setup

Google OAuth is planned for Phase 1. Configure these variables when OAuth is implemented:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## GitHub OAuth Setup

GitHub OAuth is planned for Phase 1. Configure these variables when OAuth is implemented:

```text
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

GitHub email may be missing. The app identity model uses `provider + providerUserId`.

## Docker

Docker is skipped in Phase 0. The app must run locally through the npm commands above.

````

- [ ] **Step 2: Verify README commands that do not start long-running servers**

Run:

```powershell
npm run prisma:generate -w apps/api
````

Expected: Prisma client generation succeeds.

Run:

```powershell
npm run typecheck
```

Expected: all workspaces typecheck successfully.

Run:

```powershell
npm run lint
```

Expected: ESLint exits successfully.

Run:

```powershell
npm test
```

Expected: shared, backend, and frontend tests pass.

- [ ] **Step 3: Commit README**

Run:

```powershell
git add README.md
git commit -m "docs: add phase 0 local setup"
```

Expected: Commit succeeds with Phase 0 documentation.

---

### Task 7: End-to-End Phase 0 Verification

**Files:**

- No expected source changes unless verification reveals a defect.

- [ ] **Step 1: Run the required quality gate**

Run:

```powershell
npm run typecheck
```

Expected: exits with code `0`.

Run:

```powershell
npm run lint
```

Expected: exits with code `0`.

Run:

```powershell
npm test
```

Expected: exits with code `0`.

- [ ] **Step 2: Start backend only and verify health endpoint**

Run:

```powershell
npm run dev -w apps/api
```

Expected: Nest starts on port `3001` and logs that the application started.

In a second PowerShell terminal, run:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Expected response:

```text
status  service            timestamp
------  -------            ---------
ok      habit-tracker-api  <ISO timestamp>
```

Stop the backend terminal with `Ctrl+C`.

- [ ] **Step 3: Start full app and manually verify shell**

Run:

```powershell
npm run dev
```

Expected:

- API starts on `http://localhost:3001`.
- Web starts on `http://localhost:5174`.

Open:

```text
http://localhost:5174
```

Expected visible behavior:

- Page heading is `Habit Tracker`.
- The status text changes from `Checking backend connection...` to `API connected`.
- `Create first habit` button is visible and disabled.
- `Search habits` input is visible and disabled.
- Layout is usable on a narrow viewport.

Stop the dev command with `Ctrl+C`.

- [ ] **Step 4: Record Phase 0 completion evidence**

Add a short note to the final implementation message with:

```text
Verification passed:
- npm run typecheck
- npm run lint
- npm test
- GET /api/health returned 200
- Web shell displayed API connected at http://localhost:5174
```

- [ ] **Step 5: Final commit if verification fixes were needed**

If any verification fix changed files, run:

```powershell
git add .
git commit -m "chore: verify phase 0 foundation"
```

Expected: commit succeeds. If no files changed, do not create an empty commit.

---

## Self-Review Checklist

- Phase 0 monorepo initialization is covered by Tasks 1, 2, and 4.
- Backend health endpoint is covered by Task 2 and verified again in Task 7.
- Frontend health call and basic shell are covered by Task 4 and Task 7.
- Tailwind, reusable button/input/card styling, and light theme are covered by Task 5.
- Prisma SQLite schema, migration, Prisma service, and test database helper are covered by Task 3.
- Root typecheck, lint, and test scripts are covered by Task 1 and verified in Tasks 6 and 7.
- README Phase 0 setup, database, env vars, API, WebSocket placeholder, timezone, deletion behavior, OAuth placeholder, and Docker note are covered by Task 6.
- Automated tests are included for shared constants, backend health, backend integration health, Prisma service lifecycle, frontend API client, and frontend shell behavior.
- No task calls real Google or GitHub services.
- No task trusts a client-provided `userId`; user-owned operations begin in later phases.
