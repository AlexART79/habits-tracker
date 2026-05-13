import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { configureApp } from '../src/app.setup';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase } from './database';

describe('App endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health endpoint', () => {
    it('returns 200 from GET /api/health', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'habit-tracker-api',
      });
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('auth session endpoints', () => {
    beforeEach(async () => {
      await cleanDatabase(prisma);
    });

    afterEach(async () => {
      await cleanDatabase(prisma);
    });

    it('returns 401 from GET /api/auth/me when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('persists the test-login session for GET /api/auth/me', async () => {
      const agent = request.agent(app.getHttpServer());

      const loginResponse = await agent
        .post('/api/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'session-user-1',
          email: 'session@example.com',
          displayName: 'Session User',
          avatarUrl: null,
        })
        .expect(201);

      expect(loginResponse.body).toEqual({
        user: {
          id: expect.any(String),
          provider: 'test',
          providerUserId: 'session-user-1',
          email: 'session@example.com',
          displayName: 'Session User',
          avatarUrl: null,
        },
      });

      const meResponse = await agent.get('/api/auth/me').expect(200);

      expect(meResponse.body).toEqual(loginResponse.body);
    });

    it('clears the session on POST /api/auth/logout', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent
        .post('/api/auth/test-login')
        .send({
          provider: 'github',
          providerUserId: 'logout-user-1',
          email: null,
          displayName: 'Logout User',
          avatarUrl: 'https://example.com/avatar.png',
        })
        .expect(201);

      await agent.post('/api/auth/logout').expect(200, { ok: true });
      await agent.get('/api/auth/me').expect(401);
    });

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
      const count = await prisma.user.count({
        where: { provider: 'test', providerUserId: 'same-id' },
      });

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

    it('does not expose test-login in production', async () => {
      const previousNodeEnv = process.env.NODE_ENV;
      const previousAuthTestMode = process.env.AUTH_TEST_MODE;
      process.env.NODE_ENV = 'production';
      process.env.AUTH_TEST_MODE = 'true';

      try {
        await request(app.getHttpServer())
          .post('/api/auth/test-login')
          .send({
            provider: 'test',
            providerUserId: 'blocked-user',
            email: null,
            displayName: 'Blocked User',
            avatarUrl: null,
          })
          .expect(404);
      } finally {
        if (previousNodeEnv === undefined) {
          delete process.env.NODE_ENV;
        } else {
          process.env.NODE_ENV = previousNodeEnv;
        }

        if (previousAuthTestMode === undefined) {
          delete process.env.AUTH_TEST_MODE;
        } else {
          process.env.AUTH_TEST_MODE = previousAuthTestMode;
        }
      }
    });
  });
});
