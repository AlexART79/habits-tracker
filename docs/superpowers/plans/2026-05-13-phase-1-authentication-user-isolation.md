# Phase 1 Authentication and User Isolation Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement SSO-only authentication with Google and GitHub entry points, a test/dev mock provider, persistent cookie sessions, logout, and frontend auth gating.

**Architecture:** Keep auth state server-owned in an `express-session` cookie and expose only explicit auth endpoints under `/api/auth`. Use a focused NestJS `auth` feature for session, provider profile mapping, and current-user endpoints; use a focused `users` feature for `provider + providerUserId` lookup/upsert. The React app stays dependency-light by using a small auth API client, local auth hook/provider state, and conditional login/app shell rendering.

**Tech Stack:** TypeScript strict mode, NestJS, Prisma SQLite, `express-session`, Passport OAuth strategies, React, Vite, Tailwind CSS, Vitest, Supertest, React Testing Library.

---

## Phase 1 Scope

This plan implements only Phase 1 from `docs/phased-development-plan.md`:

- `GET /api/auth/me` and `POST /api/auth/logout`.
- Test/dev mock login endpoint that never calls Google or GitHub.
- Local user creation/reuse by `provider + providerUserId`.
- Google and GitHub OAuth start/callback routes with provider profile mapping.
- Frontend login screen, auth bootstrap, protected shell, user display, and logout.
- README updates for OAuth/session/test-mode behavior.

Habit CRUD, check-ins, streak calculations, and WebSocket authorization are intentionally deferred. Phase 1 must still establish the authenticated user boundary that later phases will reuse.

## File Structure

Create or modify these files:

- `package.json` - root scripts remain unchanged unless dependency installation updates `package-lock.json`.
- `apps/api/package.json` - add auth/session dependencies and type packages.
- `apps/api/.env.example` - add session, frontend redirect, OAuth, and auth test-mode variables.
- `apps/api/src/main.ts` - bootstrap Nest and call the shared app setup helper.
- `apps/api/src/app.setup.ts` - install CORS, session middleware, global prefix, and validation pipe for both runtime and tests.
- `apps/api/src/app.module.ts` - keep `AuthModule` and `UsersModule` imported.
- `apps/api/src/auth/auth.module.ts` - wire controller, service, strategies, and session helpers.
- `apps/api/src/auth/auth.controller.ts` - thin route handlers for `/auth/me`, `/auth/logout`, provider starts/callbacks, and mock login.
- `apps/api/src/auth/auth.service.ts` - owns session login/logout, current-user lookup, provider profile normalization, and mock-login guard.
- `apps/api/src/auth/auth-session.ts` - shared session/request types and `requireSessionUserId` helper.
- `apps/api/src/auth/dto/test-login.dto.ts` - server-side validation for the mock SSO login body.
- `apps/api/src/auth/oauth-profile.ts` - provider profile types and pure mapping helpers.
- `apps/api/src/auth/oauth-profile.spec.ts` - unit tests for Google/GitHub profile mapping.
- `apps/api/src/auth/strategies/google.strategy.ts` - Google OAuth strategy wrapper.
- `apps/api/src/auth/strategies/github.strategy.ts` - GitHub OAuth strategy wrapper.
- `apps/api/src/users/users.module.ts` - export `UsersService`.
- `apps/api/src/users/users.service.ts` - Prisma-backed `findOrCreateFromProviderProfile` and `findById`.
- `apps/api/test/app.e2e-spec.ts` - add auth/session/mock-login integration coverage.
- `apps/api/test/database.ts` - keep cleanup helper; use it in auth tests.
- `packages/shared/src/api-types.ts` - add explicit auth/user response types.
- `packages/shared/src/constants.ts` - add centralized auth provider ids.
- `packages/shared/src/constants.test.ts` - verify provider constants.
- `apps/web/src/lib/apiClient.ts` - add auth API functions with `credentials: 'include'`.
- `apps/web/src/lib/apiClient.test.ts` - verify auth client URLs, methods, credentials, and errors.
- `apps/web/src/features/auth/AuthProvider.tsx` - auth bootstrap state and actions.
- `apps/web/src/features/auth/LoginPage.tsx` - Google/GitHub auth entry screen with loading/error states.
- `apps/web/src/features/auth/ProtectedShell.tsx` - authenticated shell with user display and logout.
- `apps/web/src/App.tsx` - compose `AuthProvider`, login page, and protected shell.
- `apps/web/src/App.test.tsx` - replace health-shell assertions with auth UI behavior tests.
- `README.md` - document auth endpoints, OAuth setup, env vars, session behavior, and test-mode mock provider.

## Dependencies

Install from the repo root:

```powershell
npm install express-session passport @nestjs/passport passport-google-oauth20 passport-github2 -w apps/api
npm install @types/express-session @types/passport @types/passport-google-oauth20 @types/passport-github2 -D -w apps/api
```

Expected package changes:

- `apps/api/package.json` includes the new dependencies.
- `package-lock.json` is updated.
- No frontend routing/query libraries are added in Phase 1.

---

### Task 1: Shared Auth Types and Provider Constants

**Files:**

- Modify: `packages/shared/src/constants.ts`
- Modify: `packages/shared/src/api-types.ts`
- Modify: `packages/shared/src/constants.test.ts`

- [ ] **Step 1: Write failing shared constants/types tests**

Add assertions to `packages/shared/src/constants.test.ts`:

```ts
import { AUTH_PROVIDERS, HABIT_STATUSES, MILESTONE_DAYS, WEBSOCKET_EVENTS } from './constants';

it('centralizes supported auth providers', () => {
  expect(AUTH_PROVIDERS).toEqual(['google', 'github', 'test']);
});
```

- [ ] **Step 2: Run the shared test and verify it fails**

Run:

```powershell
npm test -w packages/shared
```

Expected: FAIL because `AUTH_PROVIDERS` is not exported.

- [ ] **Step 3: Add provider constants and API response types**

Add to `packages/shared/src/constants.ts`:

```ts
export const AUTH_PROVIDERS = ['google', 'github', 'test'] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
```

Replace `packages/shared/src/api-types.ts` with:

```ts
import type { AuthProvider } from './constants';

export type HealthResponse = {
  status: 'ok';
  service: 'habit-tracker-api';
  timestamp: string;
};

export type AuthUserResponse = {
  id: string;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type AuthMeResponse = {
  user: AuthUserResponse;
};

export type AuthLogoutResponse = {
  ok: true;
};
```

- [ ] **Step 4: Run shared verification**

Run:

```powershell
npm run typecheck -w packages/shared
npm test -w packages/shared
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add packages/shared/src/constants.ts packages/shared/src/api-types.ts packages/shared/src/constants.test.ts
git commit -m "feat(shared): add auth response types"
```

---

### Task 2: Backend Session Middleware and Auth Service Foundation

**Files:**

- Modify: `apps/api/package.json`
- Modify: `apps/api/.env.example`
- Modify: `apps/api/src/main.ts`
- Create: `apps/api/src/app.setup.ts`
- Modify: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth-session.ts`
- Create: `apps/api/src/auth/dto/test-login.dto.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/users/users.service.ts`
- Modify: `apps/api/test/app.e2e-spec.ts`

- [ ] **Step 1: Install backend auth dependencies**

Run:

```powershell
npm install express-session passport @nestjs/passport passport-google-oauth20 passport-github2 -w apps/api
npm install @types/express-session @types/passport @types/passport-google-oauth20 @types/passport-github2 -D -w apps/api
```

Expected: packages install and `package-lock.json` changes.

- [ ] **Step 2: Write failing session tests**

Add these tests to `apps/api/test/app.e2e-spec.ts`, using `request.agent(app.getHttpServer())` so cookies persist:

```ts
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase } from './database';

describe('Auth session endpoints', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    prisma = app.get(PrismaService);
    await cleanDatabase(prisma);
  });

  it('returns 401 from GET /api/auth/me when unauthenticated', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('returns the current user for an authenticated test session', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/auth/test-login')
      .send({
        provider: 'test',
        providerUserId: 'user-1',
        email: 'one@example.com',
        displayName: 'Test User',
        avatarUrl: null,
      })
      .expect(201);

    const response = await agent.get('/api/auth/me').expect(200);

    expect(response.body.user).toMatchObject({
      provider: 'test',
      providerUserId: 'user-1',
      email: 'one@example.com',
      displayName: 'Test User',
      avatarUrl: null,
    });
  });

  it('clears the session on logout', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/auth/test-login')
      .send({
        provider: 'test',
        providerUserId: 'user-logout',
        email: null,
        displayName: 'Logout User',
        avatarUrl: null,
      })
      .expect(201);

    await agent.post('/api/auth/logout').expect(200, { ok: true });
    await agent.get('/api/auth/me').expect(401);
  });
});
```

- [ ] **Step 3: Run auth integration tests and verify they fail**

Run:

```powershell
npm test -w apps/api -- --run test/app.e2e-spec.ts
```

Expected: FAIL because `/api/auth/me`, `/api/auth/logout`, `/api/auth/test-login`, and session middleware do not exist.

- [ ] **Step 4: Add shared app setup and session typing**

Create `apps/api/src/auth/auth-session.ts`:

```ts
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export type SessionUser = {
  id: string;
};

export type RequestWithSession = Request & {
  session: Request['session'] & {
    user?: SessionUser;
  };
};

export function requireSessionUserId(request: RequestWithSession): string {
  const userId = request.session.user?.id;

  if (!userId) {
    throw new UnauthorizedException('Authentication required.');
  }

  return userId;
}
```

Create `apps/api/src/app.setup.ts`:

```ts
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import session from 'express-session';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5174',
    credentials: true,
  });
  app.use(
    session({
      name: 'habit_tracker_session',
      secret: process.env.SESSION_SECRET ?? 'dev-only-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
```

Modify `apps/api/src/main.ts` to use the helper:

```ts
import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
```

Modify `apps/api/test/app.e2e-spec.ts` so the test app uses the same helper:

```ts
import { configureApp } from '../src/app.setup';

app = moduleRef.createNestApplication();
configureApp(app);
await app.init();
```

Remove the duplicated inline `setGlobalPrefix` and `useGlobalPipes` calls from the test setup.

- [ ] **Step 5: Add users service**

Create `apps/api/src/users/users.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ProviderProfile = {
  provider: string;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findOrCreateFromProviderProfile(profile: ProviderProfile): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
      },
      update: {
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
      create: profile,
    });
  }
}
```

Modify `apps/api/src/users/users.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 6: Add auth controller/service**

Create `apps/api/src/auth/dto/test-login.dto.ts`:

```ts
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class TestLoginDto {
  @IsIn(['test', 'google', 'github'])
  provider!: 'test' | 'google' | 'github';

  @IsString()
  @MaxLength(128)
  providerUserId!: string;

  @IsOptional()
  @IsEmail()
  email!: string | null;

  @IsString()
  @MaxLength(120)
  displayName!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl!: string | null;
}
```

Create `apps/api/src/auth/auth.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthMeResponse, AuthUserResponse } from '@habit-tracker/shared';
import type { User } from '@prisma/client';
import { UsersService, type ProviderProfile } from '../users/users.service';
import type { RequestWithSession } from './auth-session';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(request: RequestWithSession, profile: ProviderProfile): Promise<AuthMeResponse> {
    const user = await this.usersService.findOrCreateFromProviderProfile(profile);
    request.session.user = { id: user.id };
    return { user: this.toAuthUser(user) };
  }

  async getCurrentUser(userId: string): Promise<AuthMeResponse> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('Authenticated user no longer exists.');
    }

    return { user: this.toAuthUser(user) };
  }

  logout(request: RequestWithSession): Promise<void> {
    return new Promise((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private toAuthUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      provider: user.provider as AuthUserResponse['provider'],
      providerUserId: user.providerUserId,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }
}
```

Create `apps/api/src/auth/auth.controller.ts`:

```ts
import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { AuthLogoutResponse } from '@habit-tracker/shared';
import { AuthService } from './auth.service';
import { requireSessionUserId, type RequestWithSession } from './auth-session';
import { TestLoginDto } from './dto/test-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Req() request: RequestWithSession) {
    return this.authService.getCurrentUser(requireSessionUserId(request));
  }

  @Post('test-login')
  testLogin(@Req() request: RequestWithSession, @Body() body: TestLoginDto) {
    return this.authService.login(request, body);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: RequestWithSession): Promise<AuthLogoutResponse> {
    await this.authService.logout(request);
    return { ok: true };
  }
}
```

Modify `apps/api/src/auth/auth.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 7: Run backend tests**

Run:

```powershell
npm run typecheck -w apps/api
npm test -w apps/api -- --run test/app.e2e-spec.ts
```

Expected: PASS. If `express-session` typing fails, verify `@types/express-session` is installed and imported by TypeScript.

- [ ] **Step 8: Commit**

```powershell
git add apps/api package-lock.json
git commit -m "feat(api): add session auth foundation"
```

---

### Task 3: Mock SSO Provider Guardrails and User Reuse Tests

**Files:**

- Modify: `apps/api/.env.example`
- Modify: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/test/app.e2e-spec.ts`

- [ ] **Step 1: Write failing mock-provider tests**

Add tests to `apps/api/test/app.e2e-spec.ts`:

```ts
it('creates one user for first mock login and reuses it on repeated login', async () => {
  const agent = request.agent(app.getHttpServer());
  const body = {
    provider: 'test',
    providerUserId: 'same-id',
    email: 'same@example.com',
    displayName: 'Same User',
    avatarUrl: null,
  };

  const first = await agent.post('/api/auth/test-login').send(body).expect(201);
  const second = await agent
    .post('/api/auth/test-login')
    .send({ ...body, displayName: 'Updated User' })
    .expect(201);
  const count = await prisma.user.count({ where: { provider: 'test', providerUserId: 'same-id' } });

  expect(first.body.user.id).toBe(second.body.user.id);
  expect(second.body.user.displayName).toBe('Updated User');
  expect(count).toBe(1);
});

it('creates separate users when the same provider user id uses different providers', async () => {
  const agent = request.agent(app.getHttpServer());

  const testUser = await agent
    .post('/api/auth/test-login')
    .send({
      provider: 'test',
      providerUserId: 'shared-id',
      email: null,
      displayName: 'Test User',
      avatarUrl: null,
    })
    .expect(201);
  const googleUser = await agent
    .post('/api/auth/test-login')
    .send({
      provider: 'google',
      providerUserId: 'shared-id',
      email: null,
      displayName: 'Google User',
      avatarUrl: null,
    })
    .expect(201);

  expect(testUser.body.user.id).not.toBe(googleUser.body.user.id);
});
```

- [ ] **Step 2: Add explicit mock-login availability behavior**

Update `apps/api/src/auth/auth.service.ts` so mock login is allowed only outside production or when `AUTH_TEST_MODE=true`:

```ts
assertTestLoginAllowed(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const testModeEnabled = process.env.AUTH_TEST_MODE === 'true';

  if (isProduction && !testModeEnabled) {
    throw new NotFoundException('Test login is not available.');
  }
}
```

Call `this.authService.assertTestLoginAllowed()` at the start of `AuthController.testLogin`.

- [ ] **Step 3: Add env documentation**

Add to `apps/api/.env.example`:

```text
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_TEST_MODE=true
WEB_ORIGIN=http://localhost:5174
WEB_AUTH_SUCCESS_URL=http://localhost:5174/
```

- [ ] **Step 4: Run backend auth tests**

Run:

```powershell
npm test -w apps/api -- --run test/app.e2e-spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add apps/api/.env.example apps/api/src/auth apps/api/test/app.e2e-spec.ts
git commit -m "test(api): cover mock sso user reuse"
```

---

### Task 4: OAuth Profile Mapping and Provider Routes

**Files:**

- Create: `apps/api/src/auth/oauth-profile.ts`
- Create: `apps/api/src/auth/oauth-profile.spec.ts`
- Create: `apps/api/src/auth/strategies/google.strategy.ts`
- Create: `apps/api/src/auth/strategies/github.strategy.ts`
- Modify: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/auth/auth.module.ts`
- Modify: `apps/api/.env.example`

- [ ] **Step 1: Write failing profile mapping tests**

Create `apps/api/src/auth/oauth-profile.spec.ts`:

```ts
import { mapGithubProfile, mapGoogleProfile } from './oauth-profile';

describe('OAuth profile mapping', () => {
  it('maps a Google profile into the local provider profile shape', () => {
    expect(
      mapGoogleProfile({
        id: 'google-123',
        displayName: 'Google Person',
        emails: [{ value: 'person@example.com' }],
        photos: [{ value: 'https://example.com/avatar.png' }],
      }),
    ).toEqual({
      provider: 'google',
      providerUserId: 'google-123',
      email: 'person@example.com',
      displayName: 'Google Person',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('maps a GitHub profile without assuming email exists', () => {
    expect(
      mapGithubProfile({
        id: 'github-123',
        username: 'octo',
        displayName: undefined,
        emails: [],
        photos: [],
      }),
    ).toEqual({
      provider: 'github',
      providerUserId: 'github-123',
      email: null,
      displayName: 'octo',
      avatarUrl: null,
    });
  });
});
```

- [ ] **Step 2: Run profile mapping tests and verify they fail**

Run:

```powershell
npm test -w apps/api -- --run src/auth/oauth-profile.spec.ts
```

Expected: FAIL because `oauth-profile.ts` does not exist.

- [ ] **Step 3: Add pure profile mapping helpers**

Create `apps/api/src/auth/oauth-profile.ts`:

```ts
import type { ProviderProfile } from '../users/users.service';

type OAuthEmail = { value?: string };
type OAuthPhoto = { value?: string };

export type GoogleOAuthProfile = {
  id: string;
  displayName?: string;
  emails?: OAuthEmail[];
  photos?: OAuthPhoto[];
};

export type GithubOAuthProfile = {
  id: string;
  username?: string;
  displayName?: string;
  emails?: OAuthEmail[];
  photos?: OAuthPhoto[];
};

export function mapGoogleProfile(profile: GoogleOAuthProfile): ProviderProfile {
  return {
    provider: 'google',
    providerUserId: profile.id,
    email: profile.emails?.[0]?.value ?? null,
    displayName: profile.displayName ?? 'Google user',
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

export function mapGithubProfile(profile: GithubOAuthProfile): ProviderProfile {
  return {
    provider: 'github',
    providerUserId: profile.id,
    email: profile.emails?.[0]?.value ?? null,
    displayName: profile.displayName ?? profile.username ?? 'GitHub user',
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}
```

- [ ] **Step 4: Add OAuth strategies and routes**

Create `apps/api/src/auth/strategies/google.strategy.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { mapGoogleProfile, type GoogleOAuthProfile } from '../oauth-profile';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/api/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: GoogleOAuthProfile) {
    return mapGoogleProfile(profile);
  }
}
```

Create `apps/api/src/auth/strategies/github.strategy.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { mapGithubProfile, type GithubOAuthProfile } from '../oauth-profile';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/api/auth/github/callback',
      scope: ['read:user', 'user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: GithubOAuthProfile) {
    return mapGithubProfile(profile);
  }
}
```

Modify `apps/api/src/auth/auth.module.ts` to register Passport and the provider strategies:

```ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, GoogleStrategy],
})
export class AuthModule {}
```

Add to `AuthController`:

```ts
import { Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import type { ProviderProfile } from '../users/users.service';

@Get('google')
@UseGuards(AuthGuard('google'))
startGoogleAuth(): void {}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleCallback(@Req() request: RequestWithSession & { user: ProviderProfile }, @Res() response: Response): Promise<void> {
  await this.authService.login(request, request.user);
  response.redirect(process.env.WEB_AUTH_SUCCESS_URL ?? 'http://localhost:5174/');
}

@Get('github')
@UseGuards(AuthGuard('github'))
startGithubAuth(): void {}

@Get('github/callback')
@UseGuards(AuthGuard('github'))
async githubCallback(@Req() request: RequestWithSession & { user: ProviderProfile }, @Res() response: Response): Promise<void> {
  await this.authService.login(request, request.user);
  response.redirect(process.env.WEB_AUTH_SUCCESS_URL ?? 'http://localhost:5174/');
}
```

- [ ] **Step 5: Add OAuth env example values**

Add to `apps/api/.env.example`:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

- [ ] **Step 6: Run backend verification**

Run:

```powershell
npm run typecheck -w apps/api
npm test -w apps/api -- --run src/auth/oauth-profile.spec.ts test/app.e2e-spec.ts
```

Expected: PASS. Automated tests must continue using mock login and profile mapping only; they must not call Google or GitHub.

- [ ] **Step 7: Commit**

```powershell
git add apps/api/src/auth apps/api/.env.example apps/api/package.json package-lock.json
git commit -m "feat(api): add oauth provider routes"
```

---

### Task 5: Frontend Auth API Client and State Boundary

**Files:**

- Modify: `apps/web/src/lib/apiClient.ts`
- Modify: `apps/web/src/lib/apiClient.test.ts`
- Create: `apps/web/src/features/auth/AuthProvider.tsx`

- [ ] **Step 1: Write failing API client tests**

Add tests to `apps/web/src/lib/apiClient.test.ts`:

```ts
import { getCurrentUser, logout } from './apiClient';

it('fetches current user with credentials', async () => {
  mockFetch.mockResolvedValue(
    new Response(
      JSON.stringify({
        user: {
          id: 'u1',
          provider: 'test',
          providerUserId: 'p1',
          email: null,
          displayName: 'Test User',
          avatarUrl: null,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ),
  );

  await expect(getCurrentUser()).resolves.toMatchObject({ user: { displayName: 'Test User' } });

  expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', { credentials: 'include' });
});

it('logs out with credentials', async () => {
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await expect(logout()).resolves.toEqual({ ok: true });

  expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
});
```

- [ ] **Step 2: Add auth API functions**

Update `apps/web/src/lib/apiClient.ts`:

```ts
import type { AuthLogoutResponse, AuthMeResponse, HealthResponse } from '@habit-tracker/shared';

async function readJson<TResponse>(
  response: Response,
  fallbackMessage: string,
): Promise<TResponse> {
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
  return response.json() as Promise<TResponse>;
}

export async function getHealth(): Promise<HealthResponse> {
  return readJson<HealthResponse>(await fetch('/api/health'), 'Backend health check failed.');
}

export async function getCurrentUser(): Promise<AuthMeResponse> {
  return readJson<AuthMeResponse>(
    await fetch('/api/auth/me', { credentials: 'include' }),
    'Authentication check failed.',
  );
}

export async function logout(): Promise<AuthLogoutResponse> {
  return readJson<AuthLogoutResponse>(
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }),
    'Logout failed.',
  );
}
```

- [ ] **Step 3: Add auth provider state**

Create `apps/web/src/features/auth/AuthProvider.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUserResponse } from '@habit-tracker/shared';
import { getCurrentUser, logout as logoutRequest } from '../../lib/apiClient';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUserResponse | null;
  errorMessage: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const logout = useCallback(async () => {
    setErrorMessage(null);
    try {
      await logoutRequest();
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Logout failed.');
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const value = useMemo(
    () => ({ status, user, errorMessage, refreshAuth, logout }),
    [status, user, errorMessage, refreshAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
```

- [ ] **Step 4: Run frontend client tests**

Run:

```powershell
npm run typecheck -w apps/web
npm test -w apps/web -- --run src/lib/apiClient.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add apps/web/src/lib apps/web/src/features/auth/AuthProvider.tsx
git commit -m "feat(web): add auth api state"
```

---

### Task 6: Frontend Login Page and Protected Shell

**Files:**

- Create: `apps/web/src/features/auth/LoginPage.tsx`
- Create: `apps/web/src/features/auth/ProtectedShell.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Write failing user-visible auth tests**

Replace/add tests in `apps/web/src/App.test.tsx`:

```ts
it('renders Google and GitHub login buttons when unauthenticated', async () => {
  mockFetch.mockResolvedValue(new Response(null, { status: 401 }));

  render(<App />);

  expect(await screen.findByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/google');
  expect(screen.getByRole('link', { name: 'Continue with GitHub' })).toHaveAttribute('href', '/api/auth/github');
});

it('renders authenticated shell with the user display name', async () => {
  mockFetch.mockResolvedValue(new Response(JSON.stringify({ user: { id: 'u1', provider: 'test', providerUserId: 'p1', email: null, displayName: 'Ada Lovelace', avatarUrl: null } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

  render(<App />);

  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
});

it('logs out and returns to the login screen', async () => {
  mockFetch
    .mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: 'u1', provider: 'test', providerUserId: 'p1', email: null, displayName: 'Ada Lovelace', avatarUrl: null } }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole('button', { name: 'Log out' }));

  expect(await screen.findByRole('link', { name: 'Continue with Google' })).toBeInTheDocument();
});
```

Ensure `userEvent` is imported from `@testing-library/user-event`.

- [ ] **Step 2: Create login page**

Create `apps/web/src/features/auth/LoginPage.tsx`:

```tsx
import { Card } from '../../components/Card';

export function LoginPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full p-6" aria-labelledby="login-title">
        <p className="mb-2 text-xs font-bold uppercase text-emerald-800">
          Habit Tracker with Streaks
        </p>
        <h1 id="login-title" className="text-3xl font-bold text-slate-950">
          Sign in
        </h1>
        <p className="mt-3 text-slate-600">
          Use Google or GitHub to continue. Password login is not supported.
        </p>
        <div className="mt-6 grid gap-3">
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-950 bg-slate-950 px-4 py-2 font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            href="/api/auth/google"
          >
            Continue with Google
          </a>
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            href="/api/auth/github"
          >
            Continue with GitHub
          </a>
        </div>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Create protected shell**

Create `apps/web/src/features/auth/ProtectedShell.tsx`:

```tsx
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuth } from './AuthProvider';

export function ProtectedShell(): JSX.Element {
  const { user, logout, errorMessage } = useAuth();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-800">Habit Tracker with Streaks</p>
          <h1 className="text-3xl font-bold text-slate-950">Habit Tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-700">{user?.displayName}</span>
          <Button type="button" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </header>
      {errorMessage ? (
        <p role="alert" className="mb-4 font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <Card
        className="grid items-end gap-4 p-5 md:grid-cols-[1fr_auto]"
        aria-label="Habit controls"
      >
        <Input
          id="habit-search"
          type="search"
          label="Search habits"
          placeholder="Search by name"
          disabled
        />
        <Button disabled>Create first habit</Button>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Compose auth in App**

Replace `apps/web/src/App.tsx` with:

```tsx
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedShell } from './features/auth/ProtectedShell';

function AppContent(): JSX.Element {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <main
        className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-10"
        role="status"
        aria-live="polite"
      >
        <p className="font-bold text-slate-700">Checking sign-in status...</p>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginPage />;
  }

  return <ProtectedShell />;
}

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Run frontend auth tests**

Run:

```powershell
npm run typecheck -w apps/web
npm test -w apps/web -- --run src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/App.tsx apps/web/src/App.test.tsx apps/web/src/features/auth
git commit -m "feat(web): add sso login shell"
```

---

### Task 7: README Auth Documentation

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Update environment variable documentation**

Add backend env vars:

```text
DATABASE_URL=file:./dev.db
PORT=3001
WEB_ORIGIN=http://localhost:5174
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_TEST_MODE=true
WEB_AUTH_SUCCESS_URL=http://localhost:5174/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
APP_TIMEZONE=UTC
```

- [ ] **Step 2: Document OAuth setup**

Add an auth section:

````md
## Authentication

Authentication is SSO only. The app supports Google OAuth/OIDC and GitHub OAuth. Local users are created automatically on first successful sign-in and are identified by `provider + providerUserId`; email is optional because GitHub may not return one.

### Google OAuth

Create a Google OAuth client with callback URL:

```text
http://localhost:3001/api/auth/google/callback
```

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`.

### GitHub OAuth

Create a GitHub OAuth app with callback URL:

```text
http://localhost:3001/api/auth/github/callback
```

Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL`.

### Test mode

Automated tests and local mock sign-in use `POST /api/auth/test-login`. This endpoint returns a session for a mock provider profile and does not call Google or GitHub. Do not use real provider network calls in automated tests.
````

- [ ] **Step 3: Document auth endpoints**

Add or update API summary:

```text
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/github
GET  /api/auth/github/callback
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/test-login
```

- [ ] **Step 4: Run docs-adjacent quality gate**

Run:

```powershell
npm run typecheck
npm run lint
npm test
```

Expected: PASS. This phase cannot be considered complete if any command fails.

- [ ] **Step 5: Commit**

```powershell
git add README.md
git commit -m "docs: document phase 1 auth setup"
```

---

## Final Phase 1 Verification

Run these commands from the repo root:

```powershell
npm run typecheck
npm run lint
npm test
```

Expected: all pass.

Optional local smoke test:

```powershell
npm run dev
```

Then verify:

- Open `http://localhost:5174`.
- Login page shows “Continue with Google” and “Continue with GitHub”.
- Links point to `/api/auth/google` and `/api/auth/github`.
- A mock login can create a server session through `POST http://localhost:3001/api/auth/test-login`.
- Refreshing the frontend after a valid session still shows the authenticated shell.
- Logout clears the session and returns to the login screen.

## Self-Review Notes

- Spec coverage: Stories 1.1 through 1.4 are covered by Tasks 2 through 6, with README coverage in Task 7.
- Mock SSO: covered by integration tests and no real Google/GitHub test calls.
- User identity: `provider + providerUserId` remains the only account key.
- Frontend behavior: login buttons, auth bootstrap, protected shell, display name, loading state, error state, and logout are covered by user-visible tests.
- Frontend component fit: login links use styled anchors because the existing button component is button-focused.
