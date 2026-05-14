import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import WebSocket from 'ws';
import { configureApp } from '../src/app.setup';
import { AppModule } from '../src/app.module';
import { NotificationsWebSocketServer } from '../src/notifications/notifications-websocket.server';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase } from './database';

describe('App endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    prisma = moduleRef.get(PrismaService);
    await app.listen(0);
    moduleRef.get(NotificationsWebSocketServer).attach(app.getHttpServer());
    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
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

  describe('habit endpoints', () => {
    beforeEach(async () => {
      await cleanDatabase(prisma);
    });

    afterEach(async () => {
      await cleanDatabase(prisma);
    });

    async function loginTestUser(providerUserId: string) {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/api/auth/test-login')
        .send({
          provider: 'test',
          providerUserId,
          email: `${providerUserId}@example.com`,
          displayName: providerUserId,
          avatarUrl: null,
        })
        .expect(201);

      return agent;
    }

    async function createHabit(
      agent: ReturnType<typeof request.agent>,
      name = 'Read daily',
      description = 'Read for twenty minutes',
    ) {
      const response = await agent
        .post('/api/habits')
        .send({
          name,
          description,
          startDate: '2026-05-13',
        })
        .expect(201);

      return response.body as { id: string; status: string };
    }

    function today(): string {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: process.env.APP_TIMEZONE ?? 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    }

    function currentMonth(): string {
      return today().slice(0, 7);
    }

    it('requires authentication for habit routes', async () => {
      await request(app.getHttpServer()).get('/api/habits').expect(401);
      await request(app.getHttpServer())
        .post('/api/habits')
        .send({ name: 'Read', startDate: '2026-05-13' })
        .expect(401);
    });

    it('creates a valid habit for the authenticated user', async () => {
      const agent = await loginTestUser('habit-user-1');

      const response = await agent
        .post('/api/habits')
        .send({
          name: '  Read daily  ',
          description: '  Read for twenty minutes  ',
          startDate: '2026-05-13',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Read daily',
        description: 'Read for twenty minutes',
        startDate: '2026-05-13',
        status: 'ACTIVE',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('userId');
    });

    it('rejects invalid habit create payloads', async () => {
      const agent = await loginTestUser('habit-user-2');

      await agent
        .post('/api/habits')
        .send({ name: '   ', startDate: '2026-05-13' })
        .expect(400);
      await agent
        .post('/api/habits')
        .send({ name: 'Read', startDate: '2026-05-13', status: 'DONE' })
        .expect(400);
      await agent
        .post('/api/habits')
        .send({
          name: 'Read',
          startDate: '2026-05-13',
          userId: 'client-user',
        })
        .expect(400);
    });

    it('lists and reads only the authenticated user habits', async () => {
      const firstAgent = await loginTestUser('habit-owner');
      const secondAgent = await loginTestUser('habit-other');
      const firstHabit = await createHabit(firstAgent, 'Owner habit');
      await createHabit(secondAgent, 'Other habit');

      const listResponse = await firstAgent.get('/api/habits').expect(200);
      expect(listResponse.body.habits).toHaveLength(1);
      expect(listResponse.body.habits[0]).toMatchObject({
        id: firstHabit.id,
        name: 'Owner habit',
      });

      const readResponse = await firstAgent
        .get(`/api/habits/${firstHabit.id}`)
        .expect(200);
      expect(readResponse.body).toMatchObject({
        id: firstHabit.id,
        name: 'Owner habit',
      });
    });

    it('filters habits by search text, status, and today check-in state without leaking other users data', async () => {
      const ownerAgent = await loginTestUser('filter-owner');
      const otherAgent = await loginTestUser('filter-other');
      const readingHabit = await createHabit(
        ownerAgent,
        'Read daily',
        'Read for twenty minutes',
      );
      const walkHabit = await createHabit(
        ownerAgent,
        'Walk outside',
        'Gentle exercise after lunch',
      );
      const pausedHabit = await createHabit(
        ownerAgent,
        'Plan meals',
        'Weekly meal prep',
      );

      await createHabit(otherAgent, 'Other read habit', 'Read private notes');
      await ownerAgent.patch(`/api/habits/${pausedHabit.id}`).send({ status: 'PAUSED' }).expect(200);
      await ownerAgent.post(`/api/habits/${readingHabit.id}/check-ins/today`).expect(201);

      const nameSearchResponse = await ownerAgent.get('/api/habits?search=read').expect(200);
      expect(nameSearchResponse.body.habits).toHaveLength(1);
      expect(nameSearchResponse.body.habits[0]).toMatchObject({
        id: readingHabit.id,
        name: 'Read daily',
      });

      const descriptionSearchResponse = await ownerAgent
        .get('/api/habits?search=exercise')
        .expect(200);
      expect(descriptionSearchResponse.body.habits).toHaveLength(1);
      expect(descriptionSearchResponse.body.habits[0]).toMatchObject({
        id: walkHabit.id,
        name: 'Walk outside',
      });

      const statusResponse = await ownerAgent.get('/api/habits?status=PAUSED').expect(200);
      expect(statusResponse.body.habits).toHaveLength(1);
      expect(statusResponse.body.habits[0]).toMatchObject({
        id: pausedHabit.id,
        status: 'PAUSED',
      });

      const completedTodayResponse = await ownerAgent
        .get('/api/habits?completedToday=true')
        .expect(200);
      expect(completedTodayResponse.body.habits).toEqual([
        expect.objectContaining({
          id: readingHabit.id,
          completedToday: true,
          status: 'ACTIVE',
        }),
      ]);

      const notCompletedTodayResponse = await ownerAgent
        .get('/api/habits?completedToday=false')
        .expect(200);
      expect(notCompletedTodayResponse.body.habits).toEqual([
        expect.objectContaining({
          id: walkHabit.id,
          completedToday: false,
          status: 'ACTIVE',
        }),
      ]);
    });

    it('rejects invalid today filter values and inactive today-filter combinations', async () => {
      const agent = await loginTestUser('invalid-filter-user');

      await agent.get('/api/habits?completedToday=maybe').expect(400);
      await agent.get('/api/habits?status=PAUSED&completedToday=true').expect(400);
      await agent.get('/api/habits?status=ARCHIVED&completedToday=false').expect(400);
    });

    it('blocks cross-user read and edit access', async () => {
      const ownerAgent = await loginTestUser('cross-owner');
      const otherAgent = await loginTestUser('cross-other');
      const habit = await createHabit(ownerAgent);

      await otherAgent.get(`/api/habits/${habit.id}`).expect(403);
      await otherAgent
        .patch(`/api/habits/${habit.id}`)
        .send({ name: 'Stolen edit' })
        .expect(403);
    });

    it('updates habit fields and allowed status transitions', async () => {
      const agent = await loginTestUser('habit-status-user');
      const habit = await createHabit(agent);

      const paused = await agent
        .patch(`/api/habits/${habit.id}`)
        .send({
          name: 'Read intentionally',
          description: null,
          startDate: '2026-05-14',
          status: 'PAUSED',
        })
        .expect(200);
      expect(paused.body).toMatchObject({
        name: 'Read intentionally',
        description: null,
        startDate: '2026-05-14',
        status: 'PAUSED',
      });

      const active = await agent
        .patch(`/api/habits/${habit.id}`)
        .send({ status: 'ACTIVE' })
        .expect(200);
      expect(active.body.status).toBe('ACTIVE');

      const archived = await agent
        .patch(`/api/habits/${habit.id}`)
        .send({ status: 'ARCHIVED' })
        .expect(200);
      expect(archived.body.status).toBe('ARCHIVED');
    });

    it('treats archived habits as read-only except delete', async () => {
      const agent = await loginTestUser('habit-archived-user');
      const habit = await createHabit(agent);

      await agent
        .patch(`/api/habits/${habit.id}`)
        .send({ status: 'ARCHIVED' })
        .expect(200);
      await agent
        .patch(`/api/habits/${habit.id}`)
        .send({ name: 'Cannot edit' })
        .expect(409);
      await agent.delete(`/api/habits/${habit.id}`).expect(200, { ok: true });
    });

    it('deletes an owned habit', async () => {
      const agent = await loginTestUser('habit-delete-user');
      const habit = await createHabit(agent);

      await agent.delete(`/api/habits/${habit.id}`).expect(200, { ok: true });
      await agent.get(`/api/habits/${habit.id}`).expect(404);

      const listResponse = await agent.get('/api/habits').expect(200);
      expect(listResponse.body.habits).toEqual([]);
    });

    it('creates today check-in and returns updated streak metrics', async () => {
      const agent = await loginTestUser('check-in-user');
      const habit = await createHabit(agent);

      const response = await agent
        .post(`/api/habits/${habit.id}/check-ins/today`)
        .expect(201);

      expect(response.body).toEqual({
        checkIn: {
          id: expect.any(String),
          habitId: habit.id,
          date: today(),
          createdAt: expect.any(String),
        },
        habit: expect.objectContaining({
          id: habit.id,
          completedToday: true,
          currentStreak: 1,
          bestStreak: 1,
          totalCheckIns: 1,
        }),
      });

      const listResponse = await agent.get('/api/habits').expect(200);
      expect(listResponse.body.habits[0]).toMatchObject({
        id: habit.id,
        completedToday: true,
        currentStreak: 1,
        bestStreak: 1,
        totalCheckIns: 1,
      });
    });

    it('prevents duplicate check-ins for the same habit and date', async () => {
      const agent = await loginTestUser('duplicate-check-in-user');
      const habit = await createHabit(agent);

      await agent.post(`/api/habits/${habit.id}/check-ins/today`).expect(201);
      await agent.post(`/api/habits/${habit.id}/check-ins/today`).expect(409);
    });

    it('rejects check-ins for paused and archived habits', async () => {
      const agent = await loginTestUser('inactive-check-in-user');
      const pausedHabit = await createHabit(agent, 'Paused habit');
      const archivedHabit = await createHabit(agent, 'Archived habit');

      await agent.patch(`/api/habits/${pausedHabit.id}`).send({ status: 'PAUSED' }).expect(200);
      await agent
        .patch(`/api/habits/${archivedHabit.id}`)
        .send({ status: 'ARCHIVED' })
        .expect(200);

      await agent.post(`/api/habits/${pausedHabit.id}/check-ins/today`).expect(409);
      await agent.post(`/api/habits/${archivedHabit.id}/check-ins/today`).expect(409);
    });

    it('blocks another user from check-in and undo operations', async () => {
      const ownerAgent = await loginTestUser('check-in-owner');
      const otherAgent = await loginTestUser('check-in-other');
      const habit = await createHabit(ownerAgent);

      await ownerAgent.post(`/api/habits/${habit.id}/check-ins/today`).expect(201);
      await otherAgent.post(`/api/habits/${habit.id}/check-ins/today`).expect(403);
      await otherAgent.delete(`/api/habits/${habit.id}/check-ins/today`).expect(403);
    });

    it('undoes today check-in and recalculates habit metrics', async () => {
      const agent = await loginTestUser('undo-check-in-user');
      const habit = await createHabit(agent);

      await agent.post(`/api/habits/${habit.id}/check-ins/today`).expect(201);

      const response = await agent
        .delete(`/api/habits/${habit.id}/check-ins/today`)
        .expect(200);

      expect(response.body).toEqual({
        ok: true,
        habit: expect.objectContaining({
          id: habit.id,
          completedToday: false,
          currentStreak: 0,
          bestStreak: 0,
          totalCheckIns: 0,
        }),
      });
    });

    it('returns current month check-in history for owned habits only', async () => {
      const ownerAgent = await loginTestUser('history-owner');
      const otherAgent = await loginTestUser('history-other');
      const habit = await createHabit(ownerAgent);
      const otherHabit = await createHabit(otherAgent);
      const owner = await prisma.user.findFirstOrThrow({
        where: { providerUserId: 'history-owner' },
      });
      const other = await prisma.user.findFirstOrThrow({
        where: { providerUserId: 'history-other' },
      });

      await prisma.checkIn.create({
        data: { habitId: habit.id, userId: owner.id, date: today() },
      });
      await prisma.checkIn.create({
        data: { habitId: otherHabit.id, userId: other.id, date: today() },
      });

      const response = await ownerAgent
        .get(`/api/habits/${habit.id}/check-ins?month=${currentMonth()}`)
        .expect(200);

      expect(response.body).toEqual({
        checkIns: [
          {
            id: expect.any(String),
            habitId: habit.id,
            date: today(),
            createdAt: expect.any(String),
          },
        ],
      });
      await otherAgent.get(`/api/habits/${habit.id}/check-ins?month=${currentMonth()}`).expect(403);
    });

    it('rejects invalid month history query values', async () => {
      const agent = await loginTestUser('invalid-month-user');
      const habit = await createHabit(agent);

      await agent.get(`/api/habits/${habit.id}/check-ins?month=2026-5`).expect(400);
    });
  });

  describe('milestone WebSocket notifications', () => {
    beforeEach(async () => {
      await cleanDatabase(prisma);
    });

    afterEach(async () => {
      await cleanDatabase(prisma);
    });

    async function loginTestUser(providerUserId: string) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/test-login')
        .send({
          provider: 'test',
          providerUserId,
          email: `${providerUserId}@example.com`,
          displayName: providerUserId,
          avatarUrl: null,
        })
        .expect(201);

      const setCookieHeader = response.headers['set-cookie'];
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : setCookieHeader
          ? [setCookieHeader]
          : [];

      return {
        cookie: cookies.map((cookie) => cookie.split(';')[0]).join('; '),
        userId: response.body.user.id as string,
      };
    }

    async function createHabitForUser(userId: string, name: string) {
      return prisma.habit.create({
        data: {
          userId,
          name,
          description: null,
          startDate: '2026-05-01',
          status: 'ACTIVE',
        },
      });
    }

    function previousCalendarDate(date: string, daysBack: number): string {
      const [yearText, monthText, dayText] = date.split('-');
      const dateValue = new Date(
        Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText) - daysBack),
      );

      return dateValue.toISOString().slice(0, 10);
    }

    function today(): string {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: process.env.APP_TIMEZONE ?? 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    }

    async function seedStreak(userId: string, habitId: string, length: number): Promise<void> {
      for (let offset = length - 1; offset >= 0; offset -= 1) {
        await prisma.checkIn.create({
          data: {
            userId,
            habitId,
            date: previousCalendarDate(today(), offset),
          },
        });
      }
    }

    function connectWebSocket(cookie?: string): Promise<WebSocket> {
      return new Promise((resolve, reject) => {
        const socket = new WebSocket(baseUrl.replace('http', 'ws') + '/ws', {
          headers: cookie ? { Cookie: cookie } : undefined,
        });

        socket.on('open', () => resolve(socket));
        socket.on('error', reject);
        socket.on('close', (code) => {
          if (code !== 1000) {
            reject(new Error(`WebSocket closed with ${code}`));
          }
        });
      });
    }

    function waitForMessage(socket: WebSocket): Promise<unknown> {
      return new Promise((resolve) => {
        socket.once('message', (message) => {
          resolve(JSON.parse(message.toString()) as unknown);
        });
      });
    }

    function collectMessages(socket: WebSocket, count: number): Promise<unknown[]> {
      return new Promise((resolve) => {
        const messages: unknown[] = [];

        socket.on('message', (message) => {
          messages.push(JSON.parse(message.toString()) as unknown);

          if (messages.length === count) {
            resolve(messages);
          }
        });
      });
    }

    it('rejects unauthenticated WebSocket connections', async () => {
      await expect(connectWebSocket()).rejects.toThrow(/WebSocket closed|Unexpected server response/);
    });

    it('emits 3, 7, and 30 day milestones after subscribe and does not repeat them on reconnect', async () => {
      const { cookie, userId } = await loginTestUser('milestone-owner');
      const threeDayHabit = await createHabitForUser(userId, 'Read');
      const sevenDayHabit = await createHabitForUser(userId, 'Walk');
      const thirtyDayHabit = await createHabitForUser(userId, 'Journal');
      const unreachedHabit = await createHabitForUser(userId, 'Stretch');

      await seedStreak(userId, threeDayHabit.id, 3);
      await seedStreak(userId, sevenDayHabit.id, 7);
      await seedStreak(userId, thirtyDayHabit.id, 30);
      await seedStreak(userId, unreachedHabit.id, 2);

      const socket = await connectWebSocket(cookie);
      const messages = collectMessages(socket, 3);
      socket.send(
        JSON.stringify({
          type: 'milestones.subscribe',
          payload: { clientTime: '2026-05-14T12:00:00.000Z' },
        }),
      );

      await expect(messages).resolves.toEqual(
        expect.arrayContaining([
          {
            type: 'milestone.reached',
            payload: expect.objectContaining({
              habitId: threeDayHabit.id,
              habitName: 'Read',
              milestone: 3,
              currentStreak: 3,
            }),
          },
          {
            type: 'milestone.reached',
            payload: expect.objectContaining({
              habitId: sevenDayHabit.id,
              habitName: 'Walk',
              milestone: 7,
              currentStreak: 7,
            }),
          },
          {
            type: 'milestone.reached',
            payload: expect.objectContaining({
              habitId: thirtyDayHabit.id,
              habitName: 'Journal',
              milestone: 30,
              currentStreak: 30,
            }),
          },
        ]),
      );
      expect(await prisma.milestoneNotification.count()).toBe(3);
      socket.close();

      const reconnect = await connectWebSocket(cookie);
      const repeatedMessage = Promise.race([
        waitForMessage(reconnect),
        new Promise((resolve) => setTimeout(() => resolve(null), 100)),
      ]);
      reconnect.send(
        JSON.stringify({
          type: 'milestones.subscribe',
          payload: { clientTime: '2026-05-14T12:01:00.000Z' },
        }),
      );

      await expect(repeatedMessage).resolves.toBeNull();
      reconnect.close();
    });

    it('acks only owned notifications', async () => {
      const owner = await loginTestUser('ack-owner');
      const other = await loginTestUser('ack-other');
      const ownerHabit = await createHabitForUser(owner.userId, 'Read');
      const otherHabit = await createHabitForUser(other.userId, 'Private');
      const ownerNotification = await prisma.milestoneNotification.create({
        data: { userId: owner.userId, habitId: ownerHabit.id, milestone: 3 },
      });
      const otherNotification = await prisma.milestoneNotification.create({
        data: { userId: other.userId, habitId: otherHabit.id, milestone: 3 },
      });

      const socket = await connectWebSocket(owner.cookie);
      socket.send(
        JSON.stringify({
          type: 'notification.ack',
          payload: { notificationId: ownerNotification.id },
        }),
      );
      socket.send(
        JSON.stringify({
          type: 'notification.ack',
          payload: { notificationId: otherNotification.id },
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 100));

      await expect(
        prisma.milestoneNotification.findUniqueOrThrow({
          where: { id: ownerNotification.id },
        }),
      ).resolves.toMatchObject({ acknowledgedAt: expect.any(Date) });
      await expect(
        prisma.milestoneNotification.findUniqueOrThrow({
          where: { id: otherNotification.id },
        }),
      ).resolves.toMatchObject({ acknowledgedAt: null });
      socket.close();
    });
  });
});
