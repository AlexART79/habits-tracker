import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { PrismaService } from '../prisma/prisma.service';
import { getToday } from '../streaks/streak.util';

async function createUser(prisma: PrismaService, suffix: string) {
  return prisma.user.create({
    data: {
      provider: 'google',
      providerUserId: `uid-${suffix}`,
      email: `${suffix}@example.com`,
      displayName: suffix,
      avatarUrl: null,
    },
  });
}

async function createHabit(
  prisma: PrismaService,
  userId: string,
  overrides: {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  } = {},
) {
  return prisma.habit.create({
    data: {
      userId,
      name: overrides.name ?? 'Test Habit',
      description: overrides.description ?? null,
      startDate: new Date('2026-01-01'),
      status: overrides.status ?? 'ACTIVE',
    },
  });
}

async function checkInToday(prisma: PrismaService, habitId: string) {
  return prisma.checkIn.create({
    data: { habitId, date: getToday() },
  });
}

describe('HabitsService — findAllByUser filters', () => {
  let service: HabitsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitsService, PrismaService],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.checkIn.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('no filters', () => {
    it('returns all habits for the user', async () => {
      const user = await createUser(prisma, 'alice');
      await createHabit(prisma, user.id, { name: 'Run' });
      await createHabit(prisma, user.id, { name: 'Read' });

      const result = await service.findAllByUser(user.id);
      expect(result).toHaveLength(2);
    });
  });

  describe('search filter', () => {
    it('matches habits by name (case-insensitive)', async () => {
      const user = await createUser(prisma, 'bob');
      await createHabit(prisma, user.id, { name: 'Morning Run' });
      await createHabit(prisma, user.id, { name: 'Evening Read' });

      const result = await service.findAllByUser(user.id, { search: 'morning' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Morning Run');
    });

    it('matches habits by description (case-insensitive)', async () => {
      const user = await createUser(prisma, 'carol');
      await createHabit(prisma, user.id, { name: 'Habit A', description: 'Go for a jog' });
      await createHabit(prisma, user.id, { name: 'Habit B', description: 'Drink water' });

      const result = await service.findAllByUser(user.id, { search: 'JOG' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Habit A');
    });

    it('returns empty array when search matches nothing', async () => {
      const user = await createUser(prisma, 'dave');
      await createHabit(prisma, user.id, { name: 'Run' });

      const result = await service.findAllByUser(user.id, { search: 'zzznomatch' });
      expect(result).toHaveLength(0);
    });
  });

  describe('status filter', () => {
    it('returns only habits with the requested status', async () => {
      const user = await createUser(prisma, 'eve');
      await createHabit(prisma, user.id, { name: 'Active Habit', status: 'ACTIVE' });
      await createHabit(prisma, user.id, { name: 'Paused Habit', status: 'PAUSED' });
      await createHabit(prisma, user.id, { name: 'Archived Habit', status: 'ARCHIVED' });

      const active = await service.findAllByUser(user.id, { status: 'ACTIVE' });
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('Active Habit');

      const paused = await service.findAllByUser(user.id, { status: 'PAUSED' });
      expect(paused).toHaveLength(1);
      expect(paused[0].name).toBe('Paused Habit');
    });
  });

  describe('completedToday filter', () => {
    it('returns only habits completed today when completedToday=true', async () => {
      const user = await createUser(prisma, 'frank');
      const done = await createHabit(prisma, user.id, { name: 'Done Habit' });
      await createHabit(prisma, user.id, { name: 'Pending Habit' });
      await checkInToday(prisma, done.id);

      const result = await service.findAllByUser(user.id, { completedToday: true });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Done Habit');
    });

    it('returns only habits not completed today when completedToday=false', async () => {
      const user = await createUser(prisma, 'grace');
      const done = await createHabit(prisma, user.id, { name: 'Done Habit' });
      await createHabit(prisma, user.id, { name: 'Pending Habit' });
      await checkInToday(prisma, done.id);

      const result = await service.findAllByUser(user.id, { completedToday: false });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pending Habit');
    });
  });

  describe('data isolation', () => {
    it("never returns another user's habits", async () => {
      const alice = await createUser(prisma, 'alice2');
      const bob = await createUser(prisma, 'bob2');
      await createHabit(prisma, alice.id, { name: 'Alice Habit' });
      await createHabit(prisma, bob.id, { name: 'Bob Habit' });

      const result = await service.findAllByUser(alice.id, { search: 'habit' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Habit');
    });
  });
});
