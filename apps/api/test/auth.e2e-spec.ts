import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import supertest from 'supertest';
import session = require('express-session');
import passport = require('passport');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function buildApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: false, sameSite: 'lax' as const },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.init();
  return app;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await buildApp();
    prisma = app.get(PrismaService);
  }, 30000);

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/me', () => {
    it('returns 401 when not authenticated', async () => {
      await supertest(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns the current user when authenticated', async () => {
      const agent = supertest.agent(app.getHttpServer());
      const login = await agent
        .post('/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'me-test-1',
          email: 'me@example.com',
          displayName: 'Me',
        })
        .expect(200);

      const me = await agent.get('/auth/me').expect(200);
      expect(me.body.id).toBe(login.body.id);
      expect(me.body.email).toBe('me@example.com');
    });

    it('returns 401 after logout', async () => {
      const agent = supertest.agent(app.getHttpServer());
      await agent
        .post('/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'me-test-2',
          email: 'x@example.com',
          displayName: 'X',
        })
        .expect(200);

      await agent.get('/auth/me').expect(200);
      await agent.post('/auth/logout').expect(200);
      await agent.get('/auth/me').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 even when no session exists', async () => {
      await supertest(app.getHttpServer())
        .post('/auth/logout')
        .expect(200)
        .expect({ message: 'Logged out' });
    });
  });

  describe('POST /auth/test-login', () => {
    it('creates a user and sets session on first login', async () => {
      const agent = supertest.agent(app.getHttpServer());

      const loginRes = await agent
        .post('/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'test-001',
          email: 'bob@example.com',
          displayName: 'Bob',
        })
        .expect(200);

      expect(loginRes.body.id).toBeDefined();
      expect(loginRes.body.provider).toBe('test');
      expect(loginRes.body.displayName).toBe('Bob');

      const meRes = await agent.get('/auth/me').expect(200);
      expect(meRes.body.id).toBe(loginRes.body.id);
    });

    it('returns the same user on repeated login with same provider+providerUserId', async () => {
      const agent = supertest.agent(app.getHttpServer());

      const first = await agent
        .post('/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'test-001',
          email: 'bob@example.com',
          displayName: 'Bob',
        })
        .expect(200);

      const second = await agent
        .post('/auth/test-login')
        .send({
          provider: 'test',
          providerUserId: 'test-001',
          email: 'bob@example.com',
          displayName: 'Bob',
        })
        .expect(200);

      expect(second.body.id).toBe(first.body.id);
    });

    it('creates separate accounts for different providers', async () => {
      const agent = supertest.agent(app.getHttpServer());
      const agent2 = supertest.agent(app.getHttpServer());

      const googleLogin = await agent
        .post('/auth/test-login')
        .send({
          provider: 'google',
          providerUserId: 'shared-99',
          email: 'g@example.com',
          displayName: 'Google',
        })
        .expect(200);

      const githubLogin = await agent2
        .post('/auth/test-login')
        .send({
          provider: 'github',
          providerUserId: 'shared-99',
          email: 'gh@example.com',
          displayName: 'GitHub',
        })
        .expect(200);

      expect(googleLogin.body.id).not.toBe(githubLogin.body.id);
    });

    it('returns 403 when NODE_ENV is production', async () => {
      const savedEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';
      try {
        await supertest(app.getHttpServer())
          .post('/auth/test-login')
          .send({ provider: 'test', providerUserId: 'x' })
          .expect(403);
      } finally {
        process.env['NODE_ENV'] = savedEnv;
      }
    });
  });
});
