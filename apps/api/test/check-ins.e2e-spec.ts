import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import supertest from 'supertest';
import session = require('express-session');
import passport = require('passport');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { getToday } from '../src/streaks/streak.util';

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

describe('Check-ins (e2e)', () => {
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
      .send({ provider: 'test', providerUserId: 'user-a', displayName: 'A' })
      .expect(200);
    await agentB
      .post('/auth/test-login')
      .send({ provider: 'test', providerUserId: 'user-b', displayName: 'B' })
      .expect(200);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createHabit(agent: ReturnType<typeof supertest.agent>) {
    const res = await agent.post('/habits').send(VALID_HABIT).expect(201);
    return res.body as { id: string };
  }

  async function createPausedHabit(agent: ReturnType<typeof supertest.agent>) {
    const habit = await createHabit(agent);
    await agent.patch(`/habits/${habit.id}`).send({ status: 'PAUSED' }).expect(200);
    return habit;
  }

  async function createArchivedHabit(agent: ReturnType<typeof supertest.agent>) {
    const habit = await createHabit(agent);
    await agent.patch(`/habits/${habit.id}`).send({ status: 'ARCHIVED' }).expect(200);
    return habit;
  }

  describe('POST /habits/:id/check-ins/today', () => {
    it('creates a check-in and returns 201', async () => {
      const habit = await createHabit(agentA);
      const res = await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);
      expect(res.body.date).toBe(getToday());
      expect(res.body.habitId).toBe(habit.id);
    });

    it('returns 409 on duplicate check-in for the same day', async () => {
      const habit = await createHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(409);
    });

    it('returns 400 for a paused habit', async () => {
      const habit = await createPausedHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(400);
    });

    it('returns 400 for an archived habit', async () => {
      const habit = await createArchivedHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(400);
    });

    it("returns 403 when checking in another user's habit", async () => {
      const habit = await createHabit(agentA);
      await agentB.post(`/habits/${habit.id}/check-ins/today`).expect(403);
    });

    it('returns 404 for a nonexistent habit', async () => {
      await agentA.post('/habits/nonexistent/check-ins/today').expect(404);
    });

    it('returns 401 when unauthenticated', async () => {
      const habit = await createHabit(agentA);
      await supertest(app.getHttpServer()).post(`/habits/${habit.id}/check-ins/today`).expect(401);
    });
  });

  describe('DELETE /habits/:id/check-ins/today', () => {
    it('removes today check-in and returns 204', async () => {
      const habit = await createHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);
      await agentA.delete(`/habits/${habit.id}/check-ins/today`).expect(204);
    });

    it('returns 404 when no check-in exists for today', async () => {
      const habit = await createHabit(agentA);
      await agentA.delete(`/habits/${habit.id}/check-ins/today`).expect(404);
    });

    it("returns 403 when undoing another user's habit check-in", async () => {
      const habit = await createHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);
      await agentB.delete(`/habits/${habit.id}/check-ins/today`).expect(403);
    });

    it('returns 401 when unauthenticated', async () => {
      const habit = await createHabit(agentA);
      await supertest(app.getHttpServer())
        .delete(`/habits/${habit.id}/check-ins/today`)
        .expect(401);
    });
  });

  describe('GET /habits/:id/check-ins', () => {
    it('returns dates for the requested month', async () => {
      const habit = await createHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);
      const month = getToday().slice(0, 7);
      const res = await agentA.get(`/habits/${habit.id}/check-ins?month=${month}`).expect(200);
      expect(res.body.dates).toContain(getToday());
    });

    it('returns empty dates array when no check-ins in month', async () => {
      const habit = await createHabit(agentA);
      const res = await agentA.get(`/habits/${habit.id}/check-ins?month=2020-01`).expect(200);
      expect(res.body.dates).toEqual([]);
    });

    it('returns 400 for invalid month format', async () => {
      const habit = await createHabit(agentA);
      await agentA.get(`/habits/${habit.id}/check-ins?month=bad-month`).expect(400);
    });

    it("returns 403 when accessing another user's habit", async () => {
      const habit = await createHabit(agentA);
      const month = getToday().slice(0, 7);
      await agentB.get(`/habits/${habit.id}/check-ins?month=${month}`).expect(403);
    });
  });

  describe('GET /habits enriched with streak data', () => {
    it('includes streak fields in habit list response', async () => {
      const habit = await createHabit(agentA);
      await agentA.post(`/habits/${habit.id}/check-ins/today`).expect(201);

      const res = await agentA.get('/habits').expect(200);
      const h = res.body[0];
      expect(h.currentStreak).toBe(1);
      expect(h.bestStreak).toBe(1);
      expect(h.totalCheckIns).toBe(1);
      expect(h.completedToday).toBe(true);
    });

    it('shows completedToday false before check-in', async () => {
      await createHabit(agentA);
      const res = await agentA.get('/habits').expect(200);
      expect(res.body[0].completedToday).toBe(false);
      expect(res.body[0].currentStreak).toBe(0);
    });
  });
});
