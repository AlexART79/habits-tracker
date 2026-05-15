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

const VALID_HABIT = { name: 'Morning Run', startDate: '2026-01-01' };

describe('Habits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;

  beforeAll(async () => {
    app = await buildApp();
    prisma = app.get(PrismaService);
  }, 30000);

  beforeEach(async () => {
    agentA = supertest.agent(app.getHttpServer());
    agentB = supertest.agent(app.getHttpServer());
    await agentA
      .post('/auth/test-login')
      .send({ provider: 'test', providerUserId: 'user-a', email: 'a@test.com', displayName: 'A' })
      .expect(200);
    await agentB
      .post('/auth/test-login')
      .send({ provider: 'test', providerUserId: 'user-b', email: 'b@test.com', displayName: 'B' })
      .expect(200);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /habits', () => {
    it('creates a valid habit and returns 201', async () => {
      const res = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Morning Run');
      expect(res.body.status).toBe('ACTIVE');
    });

    it('rejects empty name with 400', async () => {
      await agentA.post('/habits').send({ name: '', startDate: '2026-01-01' }).expect(400);
    });

    it('rejects name exceeding 100 chars with 400', async () => {
      await agentA
        .post('/habits')
        .send({ name: 'a'.repeat(101), startDate: '2026-01-01' })
        .expect(400);
    });

    it('rejects unknown fields with 400', async () => {
      await agentA
        .post('/habits')
        .send({ ...VALID_HABIT, status: 'ACTIVE' })
        .expect(400);
    });

    it('rejects missing startDate with 400', async () => {
      await agentA.post('/habits').send({ name: 'Run' }).expect(400);
    });

    it('returns 401 when not authenticated', async () => {
      await supertest(app.getHttpServer()).post('/habits').send(VALID_HABIT).expect(401);
    });
  });

  describe('GET /habits', () => {
    it("returns only the caller's habits", async () => {
      await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentB.post('/habits').send({ name: 'Yoga', startDate: '2026-01-01' }).expect(201);

      const res = await agentA.get('/habits').expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Morning Run');
    });

    it('returns an empty array when the user has no habits', async () => {
      const res = await agentA.get('/habits').expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /habits/:id', () => {
    it('returns the habit for the owner', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      const res = await agentA.get(`/habits/${created.body.id}`).expect(200);
      expect(res.body.id).toBe(created.body.id);
    });

    it('returns 403 when the requesting user is not the owner', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentB.get(`/habits/${created.body.id}`).expect(403);
    });

    it('returns 404 for a nonexistent id', async () => {
      await agentA.get('/habits/nonexistent-id').expect(404);
    });
  });

  describe('PATCH /habits/:id', () => {
    it('updates the habit name', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      const res = await agentA
        .patch(`/habits/${created.body.id}`)
        .send({ name: 'Evening Run' })
        .expect(200);
      expect(res.body.name).toBe('Evening Run');
    });

    it('transitions status from ACTIVE to PAUSED', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      const res = await agentA
        .patch(`/habits/${created.body.id}`)
        .send({ status: 'PAUSED' })
        .expect(200);
      expect(res.body.status).toBe('PAUSED');
    });

    it('transitions status from PAUSED to ACTIVE (resume)', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentA.patch(`/habits/${created.body.id}`).send({ status: 'PAUSED' }).expect(200);
      const res = await agentA
        .patch(`/habits/${created.body.id}`)
        .send({ status: 'ACTIVE' })
        .expect(200);
      expect(res.body.status).toBe('ACTIVE');
    });

    it('archives a habit', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      const res = await agentA
        .patch(`/habits/${created.body.id}`)
        .send({ status: 'ARCHIVED' })
        .expect(200);
      expect(res.body.status).toBe('ARCHIVED');
    });

    it('returns 400 when patching an archived habit', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentA.patch(`/habits/${created.body.id}`).send({ status: 'ARCHIVED' }).expect(200);
      await agentA.patch(`/habits/${created.body.id}`).send({ name: 'New Name' }).expect(400);
    });

    it('returns 403 when the requesting user is not the owner', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentB.patch(`/habits/${created.body.id}`).send({ name: 'Hacked' }).expect(403);
    });
  });

  describe('DELETE /habits/:id', () => {
    it('deletes own habit and returns 204', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentA.delete(`/habits/${created.body.id}`).expect(204);
      await agentA.get(`/habits/${created.body.id}`).expect(404);
    });

    it('allows deleting an archived habit', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentA.patch(`/habits/${created.body.id}`).send({ status: 'ARCHIVED' }).expect(200);
      await agentA.delete(`/habits/${created.body.id}`).expect(204);
    });

    it('returns 403 when the requesting user is not the owner', async () => {
      const created = await agentA.post('/habits').send(VALID_HABIT).expect(201);
      await agentB.delete(`/habits/${created.body.id}`).expect(403);
    });

    it('returns 404 for a nonexistent habit', async () => {
      await agentA.delete('/habits/nonexistent-id').expect(404);
    });
  });
});
