import { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanDatabase } from '../../test/database';
import {
  DEBUG_HABIT_SEED_NAMES,
  seedHabitDebugData,
} from './habitDebugData';

describe('seedHabitDebugData', () => {
  const prisma = new PrismaClient();
  const userId = 'cmp49ummz0000jiqbx6uq6c6j';
  const otherUserId = 'other-user';

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await prisma.user.create({
      data: {
        id: userId,
        provider: 'test',
        providerUserId: 'seed-user',
        email: 'seed@example.com',
        displayName: 'Seed User',
      },
    });
    await prisma.user.create({
      data: {
        id: otherUserId,
        provider: 'test',
        providerUserId: 'other-user',
        email: 'other@example.com',
        displayName: 'Other User',
        habits: {
          create: {
            name: DEBUG_HABIT_SEED_NAMES[0],
            description: 'Existing habit with a seed-like name for another user.',
            startDate: '2026-05-01',
          },
        },
      },
    });
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await prisma.$disconnect();
  });

  it('creates a deterministic visual testing dataset for one user only', async () => {
    const firstRun = await seedHabitDebugData(prisma, userId);
    const secondRun = await seedHabitDebugData(prisma, userId);

    expect(firstRun).toEqual(secondRun);
    expect(secondRun).toEqual({
      userId,
      habitsCreated: 6,
      checkInsCreated: 57,
    });

    const seededHabits = await prisma.habit.findMany({
      where: { userId },
      include: { checkIns: true },
      orderBy: { name: 'asc' },
    });
    const otherUserHabits = await prisma.habit.findMany({
      where: { userId: otherUserId },
      include: { checkIns: true },
    });

    expect(seededHabits).toHaveLength(6);
    expect(seededHabits.map((habit) => habit.name).sort()).toEqual(
      [...DEBUG_HABIT_SEED_NAMES].sort(),
    );
    expect(seededHabits.reduce((total, habit) => total + habit.checkIns.length, 0)).toBe(57);
    expect(otherUserHabits).toHaveLength(1);
    expect(otherUserHabits[0]?.name).toBe(DEBUG_HABIT_SEED_NAMES[0]);
  });

  it('fails clearly when the target user does not exist', async () => {
    await expect(seedHabitDebugData(prisma, 'missing-user')).rejects.toThrow(
      'Cannot seed habit debug data because user missing-user does not exist.',
    );
  });
});
