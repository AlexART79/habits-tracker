# Phase 0 — Project Foundation and Local Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a runnable monorepo with NestJS API on port 3002, React/Vite UI on port 5175, Tailwind styling, SQLite/Prisma, linting, type-checking, and test infrastructure — everything passing `typecheck`, `lint`, and `test`.

**Architecture:** npm workspaces monorepo with `apps/api` (NestJS) and `apps/web` (React + Vite). Backend exposes a `/health` endpoint and a PrismaService connected to SQLite. Frontend shows a layout shell with reusable Tailwind components.

**Tech Stack:** Node.js 20+, TypeScript (strict), NestJS 10, React 19 + Vite, Tailwind CSS v3, Prisma 5 + SQLite, Jest + ts-jest (backend), Vitest + React Testing Library (frontend), ESLint, Prettier, concurrently.

---

## File Map

**Root:**
- Create: `package.json` — workspace config, root scripts, concurrently dependency
- Create: `tsconfig.base.json` — shared TypeScript strict settings
- Create: `.prettierrc` — Prettier config
- Create: `.prettierignore`

**apps/api (NestJS CLI scaffolds most, then we modify):**
- Modify: `apps/api/package.json` — add `dev`, `typecheck`, `prisma:migrate` scripts
- Modify: `apps/api/tsconfig.json` — extend tsconfig.base.json
- Modify: `apps/api/.eslintrc.js` — prettier integration
- Modify: `apps/api/src/main.ts` — port 3002, global ValidationPipe
- Modify: `apps/api/src/app.module.ts` — add PrismaModule
- Modify: `apps/api/src/app.controller.ts` — GET /health endpoint
- Modify: `apps/api/src/app.controller.spec.ts` — test /health
- Modify: `apps/api/src/app.service.ts` — empty shell (keep for AppModule)
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.spec.ts`
- Create: `apps/api/prisma/schema.prisma` — all 4 models
- Create: `apps/api/.env` — DATABASE_URL (gitignored)
- Create: `apps/api/.env.example`
- Create: `apps/api/test/setup-env.ts` — sets DATABASE_URL for Jest

**apps/web (Vite CLI scaffolds most, then we modify):**
- Modify: `apps/web/package.json` — add `typecheck`, `test` scripts; add testing deps
- Modify: `apps/web/tsconfig.app.json` — extend tsconfig.base.json
- Modify: `apps/web/tsconfig.node.json` — extend tsconfig.base.json
- Modify: `apps/web/vite.config.ts` — port 5175
- Create: `apps/web/vitest.config.ts` — jsdom, RTL setup
- Create: `apps/web/src/test/setup.ts` — jest-dom matchers
- Modify: `apps/web/src/index.css` — Tailwind directives
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Modify: `apps/web/src/App.tsx` — layout shell
- Create: `apps/web/src/components/Layout.tsx`
- Create: `apps/web/src/components/Layout.test.tsx`
- Create: `apps/web/src/components/Button.tsx`
- Create: `apps/web/src/components/Button.test.tsx`
- Create: `apps/web/src/components/Card.tsx`
- Create: `apps/web/src/components/Card.test.tsx`

---

## Task 1: Root Workspace Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "habits-tracker",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "typecheck": "npm run typecheck -w apps/api && npm run typecheck -w apps/web",
    "lint": "npm run lint -w apps/api && npm run lint -w apps/web",
    "test": "npm test -w apps/api && npm test -w apps/web",
    "prisma:migrate": "npm run prisma:migrate -w apps/api"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

- [ ] **Step 4: Create `.prettierignore`**

```
node_modules
dist
coverage
apps/api/prisma/migrations
```

- [ ] **Step 5: Commit**

```powershell
git add package.json tsconfig.base.json .prettierrc .prettierignore
git commit -m "chore: initialize monorepo root with npm workspaces"
```

---

## Task 2: Scaffold NestJS API

**Files:**
- Create: `apps/api/` (via NestJS CLI)
- Modify: `apps/api/package.json`
- Modify: `apps/api/tsconfig.json`
- Modify: `apps/api/.eslintrc.js`

- [ ] **Step 1: Scaffold NestJS app (skip install — root `npm install` handles it)**

```powershell
npx @nestjs/cli new apps/api --skip-install --skip-git --strict --package-manager npm
```

Expected: `apps/api/` created with `src/`, `test/`, `package.json`, `tsconfig.json`, `nest-cli.json`, `.eslintrc.js`.

- [ ] **Step 2: Replace `apps/api/package.json`**

```json
{
  "name": "api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.22.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "prisma": "^5.22.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "setupFiles": ["<rootDir>/../test/setup-env.ts"]
  }
}
```

- [ ] **Step 3: Replace `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "paths": {}
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Replace `apps/api/.eslintrc.js`**

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

- [ ] **Step 5: Create `apps/api/test/setup-env.ts`** (needed so Jest finds DATABASE_URL before PrismaClient instantiation)

```typescript
process.env['DATABASE_URL'] = 'file:./test.db';
```

- [ ] **Step 6: Commit scaffold**

```powershell
git add apps/api
git commit -m "chore: scaffold NestJS API with workspace config"
```

---

## Task 3: Health Endpoint (TDD)

**Files:**
- Modify: `apps/api/src/app.controller.spec.ts`
- Modify: `apps/api/src/app.controller.ts`
- Modify: `apps/api/src/app.service.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`

> Run `npm install` at root before this task so ts-jest is available.
> ```powershell
> npm install
> ```

- [ ] **Step 1: Write the failing test**

Replace `apps/api/src/app.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('returns { status: "ok" } from GET /health', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```powershell
npm test -w apps/api
```

Expected: FAIL — `controller.health is not a function` (scaffold controller has `getHello`, not `health`).

- [ ] **Step 3: Implement the health endpoint**

Replace `apps/api/src/app.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
```

- [ ] **Step 4: Simplify AppService (no longer exposes getHello)**

Replace `apps/api/src/app.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {}
```

- [ ] **Step 5: Update AppModule**

Replace `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 6: Update main.ts — port 3002 + global ValidationPipe**

Replace `apps/api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3002);
  console.log('API running on http://localhost:3002');
}
bootstrap();
```

- [ ] **Step 7: Run test to verify pass**

```powershell
npm test -w apps/api
```

Expected: PASS — `AppController > returns { status: "ok" } from GET /health`.

- [ ] **Step 8: Run typecheck and lint**

```powershell
npm run typecheck -w apps/api
npm run lint -w apps/api
```

Expected: No errors.

- [ ] **Step 9: Commit**

```powershell
git add apps/api/src
git commit -m "feat: add GET /health endpoint on port 3002"
```

---

## Task 4: Scaffold React/Vite Web App

**Files:**
- Create: `apps/web/` (via Vite CLI)
- Modify: `apps/web/package.json`
- Modify: `apps/web/tsconfig.app.json`
- Modify: `apps/web/tsconfig.node.json`
- Modify: `apps/web/vite.config.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test/setup.ts`

- [ ] **Step 1: Scaffold Vite React TypeScript app**

```powershell
npx create-vite@latest apps/web --template react-ts
```

When prompted for project name/framework/variant, select `react-ts` or pass it directly. The scaffold does NOT auto-install.

Expected: `apps/web/` created with `src/`, `index.html`, `vite.config.ts`, `tsconfig*.json`.

- [ ] **Step 2: Replace `apps/web/package.json`**

```json
{
  "name": "web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.1",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 3: Replace `apps/web/tsconfig.app.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Replace `apps/web/tsconfig.node.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "postcss.config.js", "tailwind.config.js"]
}
```

- [ ] **Step 5: Replace `apps/web/vite.config.ts` — set port 5175**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
});
```

- [ ] **Step 6: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 7: Create `apps/web/src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 8: Install all workspace dependencies**

```powershell
npm install
```

Expected: Root `node_modules/` updated with all packages from `apps/api` and `apps/web`. This single command handles everything.

- [ ] **Step 9: Commit**

```powershell
git add apps/web package-lock.json
git commit -m "chore: scaffold React/Vite web app with Vitest"
```

---

## Task 5: Tailwind and Design Shell (TDD)

**Files:**
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Modify: `apps/web/src/index.css`
- Create: `apps/web/src/components/Layout.tsx` + `Layout.test.tsx`
- Create: `apps/web/src/components/Button.tsx` + `Button.test.tsx`
- Create: `apps/web/src/components/Card.tsx` + `Card.test.tsx`
- Modify: `apps/web/src/App.tsx`

### 5a — Tailwind Configuration

- [ ] **Step 1: Create `apps/web/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 2: Create `apps/web/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Replace `apps/web/src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5b — Layout Component (TDD)

- [ ] **Step 4: Write the failing Layout test**

Create `apps/web/src/components/Layout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders the "Habit Tracker" h1 heading', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('heading', { name: /habit tracker/i, level: 1 })).toBeInTheDocument();
  });

  it('renders children inside the main area', () => {
    render(<Layout><p>Hello Test</p></Layout>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('renders a header landmark', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders a main landmark', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test to verify failure**

```powershell
npm test -w apps/web
```

Expected: FAIL — `Cannot find module './Layout'`.

- [ ] **Step 6: Implement Layout**

Create `apps/web/src/components/Layout.tsx`:

```tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Run test to verify Layout passes**

```powershell
npm test -w apps/web
```

Expected: PASS — 4 Layout tests pass.

### 5c — Button Component (TDD)

- [ ] **Step 8: Write the failing Button test**

Create `apps/web/src/components/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders primary variant by default with blue background class', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button', { name: /primary/i })).toHaveClass('bg-blue-600');
  });

  it('renders secondary variant with white background class', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button', { name: /secondary/i })).toHaveClass('bg-white');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await userEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 9: Run test to verify failure**

```powershell
npm test -w apps/web
```

Expected: FAIL — `Cannot find module './Button'`.

- [ ] **Step 10: Implement Button**

Create `apps/web/src/components/Button.tsx`:

```tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300 border-gray-300',
};

export function Button({ variant = 'primary', children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
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

- [ ] **Step 11: Run test to verify Button passes**

```powershell
npm test -w apps/web
```

Expected: PASS — all 10 tests pass (Layout + Button).

### 5d — Card Component (TDD)

- [ ] **Step 12: Write the failing Card test**

Create `apps/web/src/components/Card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a heading when title is provided', () => {
    render(<Card title="My Habit"><p>content</p></Card>);
    expect(screen.getByRole('heading', { name: /my habit/i })).toBeInTheDocument();
  });

  it('does not render a heading when title is omitted', () => {
    render(<Card><p>no title</p></Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 13: Run test to verify failure**

```powershell
npm test -w apps/web
```

Expected: FAIL — `Cannot find module './Card'`.

- [ ] **Step 14: Implement Card**

Create `apps/web/src/components/Card.tsx`:

```tsx
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-lg border border-gray-200 shadow-sm p-6',
        className,
      ].join(' ')}
    >
      {title && <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>}
      {children}
    </div>
  );
}
```

- [ ] **Step 15: Run all web tests to verify all pass**

```powershell
npm test -w apps/web
```

Expected: PASS — 13 tests pass across Layout, Button, Card.

### 5e — Wire up App.tsx

- [ ] **Step 16: Replace `apps/web/src/App.tsx`**

```tsx
import { Layout } from './components/Layout';
import { Card } from './components/Card';
import { Button } from './components/Button';

function App() {
  return (
    <Layout>
      <Card title="Welcome">
        <p className="text-gray-600 mb-4">Your habits, tracked daily.</p>
        <Button>Get Started</Button>
      </Card>
    </Layout>
  );
}

export default App;
```

- [ ] **Step 17: Ensure `apps/web/src/main.tsx` imports index.css**

The Vite scaffold includes this. Verify the file starts with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

If it differs, replace it with the above.

- [ ] **Step 18: Delete unused Vite default files if present**

The scaffold may generate `src/App.css` and `src/assets/react.svg`. Remove if they exist (they conflict with Tailwind-only styling):

```powershell
Remove-Item -Force apps/web/src/App.css -ErrorAction SilentlyContinue
Remove-Item -Force apps/web/src/assets/react.svg -ErrorAction SilentlyContinue
```

- [ ] **Step 19: Run typecheck and lint**

```powershell
npm run typecheck -w apps/web
npm run lint -w apps/web
```

Expected: No errors. If lint reports `react.svg` as unused import in App.tsx, remove that import line.

- [ ] **Step 20: Commit**

```powershell
git add apps/web
git commit -m "feat: add Tailwind CSS design shell with Layout, Button, Card components"
```

---

## Task 6: Prisma + SQLite (TDD)

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/.env`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/prisma/prisma.service.spec.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write the failing PrismaService test**

Create `apps/api/src/prisma/prisma.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await service.$disconnect();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('is an instance of PrismaService', () => {
    expect(service).toBeInstanceOf(PrismaService);
  });

  it('has a $connect method', () => {
    expect(typeof service.$connect).toBe('function');
  });

  it('has a $disconnect method', () => {
    expect(typeof service.$disconnect).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```powershell
npm test -w apps/api
```

Expected: FAIL — `Cannot find module './prisma.service'`.

- [ ] **Step 3: Create Prisma schema**

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
  id             String   @id @default(cuid())
  provider       String
  providerUserId String
  email          String?
  displayName    String?
  createdAt      DateTime @default(now())
  habits         Habit[]

  @@unique([provider, providerUserId])
}

model Habit {
  id                     String                  @id @default(cuid())
  userId                 String
  name                   String
  description            String?
  startDate              String
  status                 String                  @default("ACTIVE")
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt
  user                   User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIns               CheckIn[]
  milestoneNotifications MilestoneNotification[]
}

model CheckIn {
  id        String   @id @default(cuid())
  habitId   String
  date      String
  createdAt DateTime @default(now())
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
}

model MilestoneNotification {
  id        String   @id @default(cuid())
  habitId   String
  milestone Int
  sentAt    DateTime @default(now())
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, milestone])
}
```

- [ ] **Step 4: Create `apps/api/.env`**

```
DATABASE_URL="file:./prisma/dev.db"
```

- [ ] **Step 5: Create `apps/api/.env.example`**

```
DATABASE_URL="file:./prisma/dev.db"
```

- [ ] **Step 6: Add .env and dev.db to .gitignore**

Check `apps/api/.gitignore` (NestJS scaffold creates one). Ensure it contains:

```
.env
prisma/dev.db
prisma/test.db
prisma/*.db
```

Add any missing lines. The scaffold usually has `.env` already.

- [ ] **Step 7: Run first Prisma migration**

```powershell
$env:DATABASE_URL = "file:./prisma/dev.db"
npm run prisma:migrate -w apps/api -- --name init
```

Expected output includes:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./prisma/dev.db"
Applying migration `20XXXXXX_init`
Your database is now in sync with your schema.
Running generate... - Prisma Client Generated
```

This creates `apps/api/prisma/dev.db` and `apps/api/prisma/migrations/TIMESTAMP_init/migration.sql`.

- [ ] **Step 8: Implement PrismaService**

Create `apps/api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 9: Implement PrismaModule**

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

- [ ] **Step 10: Run test to verify PrismaService passes**

```powershell
npm test -w apps/api
```

Expected: PASS — both `AppController` (1 test) and `PrismaService` (4 tests) pass.

- [ ] **Step 11: Add PrismaModule to AppModule**

Replace `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 12: Run typecheck and lint**

```powershell
npm run typecheck -w apps/api
npm run lint -w apps/api
```

Expected: No errors.

- [ ] **Step 13: Commit**

```powershell
git add apps/api/prisma apps/api/src/prisma apps/api/src/app.module.ts apps/api/.env.example
git commit -m "feat: add Prisma with SQLite schema and PrismaModule"
```

---

## Task 7: Final Quality Gate

- [ ] **Step 1: Run full typecheck**

```powershell
npm run typecheck
```

Expected: Zero errors from both `apps/api` and `apps/web`.

- [ ] **Step 2: Run full lint**

```powershell
npm run lint
```

Expected: Zero errors. The API lint uses `--fix` so Prettier issues are auto-corrected.

- [ ] **Step 3: Run full test suite**

```powershell
npm test
```

Expected output:

```
# apps/api
PASS src/app.controller.spec.ts
  AppController
    ✓ returns { status: "ok" } from GET /health

PASS src/prisma/prisma.service.spec.ts
  PrismaService
    ✓ is defined
    ✓ is an instance of PrismaService
    ✓ has a $connect method
    ✓ has a $disconnect method

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total

# apps/web
✓ src/components/Layout.test.tsx (4 tests)
✓ src/components/Button.test.tsx (6 tests)
✓ src/components/Card.test.tsx (3 tests)

Test Files  3 passed (3)
Tests       13 passed (13)
```

- [ ] **Step 4: Smoke test both servers**

```powershell
npm run dev
```

Expected:
- concurrently starts both processes
- API logs: `API running on http://localhost:3002`
- Web logs: `VITE v5.x ready ... Local: http://localhost:5175/`

In a second terminal, verify the health endpoint:

```powershell
Invoke-WebRequest -Uri http://localhost:3002/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: `{"status":"ok"}`

Stop both servers with `Ctrl+C`.

- [ ] **Step 5: Final commit**

```powershell
git add .
git commit -m "feat: Phase 0 complete — NestJS API, React/Vite UI, Tailwind, Prisma/SQLite, full test suite"
```

---

## Verification Checklist

Phase 0 is complete when all of the following pass:

| Check | Command | Expected |
|---|---|---|
| Typecheck | `npm run typecheck` | Exit 0, no output |
| Lint | `npm run lint` | Exit 0, no output |
| Tests | `npm test` | 5 backend + 13 frontend tests pass |
| API starts | `npm run dev` then visit 3002 | `{"status":"ok"}` |
| Web starts | `npm run dev` then visit 5175 | Layout shell renders |
| Prisma migration | File exists at `apps/api/prisma/dev.db` | SQLite DB file present |

---

## Troubleshooting

### `nest new` installs its own `node_modules` despite `--skip-install`

If a `node_modules` folder appears inside `apps/api`, remove it and re-run root install:

```powershell
Remove-Item -Recurse -Force apps/api/node_modules
npm install
```

### Prisma client not found after `npm install`

The `@prisma/client` module requires a generation step. Run:

```powershell
npm run prisma:generate -w apps/api
```

### `DATABASE_URL` env var missing during tests

The file `apps/api/test/setup-env.ts` sets it for Jest. If tests still fail with "DATABASE_URL not set", verify the `jest` config in `apps/api/package.json` includes:

```json
"setupFiles": ["<rootDir>/../test/setup-env.ts"]
```

### Vite scaffold generates `App.css` imported in `App.tsx`

After replacing `App.tsx`, delete the old CSS file and remove any stale import:

```powershell
Remove-Item -Force apps/web/src/App.css -ErrorAction SilentlyContinue
```

### ESLint version mismatch

`apps/api` uses ESLint v8 (`.eslintrc.js` format); `apps/web` uses ESLint v9 (`eslint.config.js` flat config). This is intentional — each app's lint script targets only its own directory. The root `npm run lint` delegates to each.
