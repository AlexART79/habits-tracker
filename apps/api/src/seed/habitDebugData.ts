import type { PrismaClient } from '@prisma/client';
import { getTodayCalendarDate } from '../streaks/calendar-date';

export const DEFAULT_DEBUG_SEED_USER_ID = 'cmp49ummz0000jiqbx6uq6c6j';

export const DEBUG_HABIT_SEED_NAMES = [
  'Seed: 3-day current streak',
  'Seed: 7-day current streak',
  'Seed: 30-day milestone streak',
  'Seed: Click today for 7-day milestone',
  'Seed: Broken streak history',
  'Seed: Paused habit with history',
  'Seed: Archived habit with history',
] as const;

type DebugHabitSeedName = (typeof DEBUG_HABIT_SEED_NAMES)[number];

type DebugHabitSeed = {
  name: DebugHabitSeedName;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dayOffsets: number[];
};

export type HabitDebugSeedResult = {
  userId: string;
  habitsCreated: number;
  checkInsCreated: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function dateFromOffset(today: string, offset: number): string {
  const [yearText, monthText, dayText] = today.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return new Date(Date.UTC(year, month - 1, day) + offset * DAY_IN_MS)
    .toISOString()
    .slice(0, 10);
}

function buildDebugHabits(): DebugHabitSeed[] {
  return [
    {
      name: 'Seed: 3-day current streak',
      description: 'Debug data: completed today and the previous 2 days.',
      status: 'ACTIVE',
      dayOffsets: [0, -1, -2],
    },
    {
      name: 'Seed: 7-day current streak',
      description: 'Debug data: completed today and the previous 6 days.',
      status: 'ACTIVE',
      dayOffsets: [0, -1, -2, -3, -4, -5, -6],
    },
    {
      name: 'Seed: 30-day milestone streak',
      description: 'Debug data: 30 consecutive completions ending today.',
      status: 'ACTIVE',
      dayOffsets: Array.from({ length: 30 }, (_, index) => -index),
    },
    {
      name: 'Seed: Click today for 7-day milestone',
      description:
        'Debug data: six consecutive prior completions; check in today to reach 7 days.',
      status: 'ACTIVE',
      dayOffsets: [-1, -2, -3, -4, -5, -6],
    },
    {
      name: 'Seed: Broken streak history',
      description: 'Debug data: older check-ins with gaps and no completion today.',
      status: 'ACTIVE',
      dayOffsets: [-2, -3, -4, -5, -6, -10, -11, -12, -17, -19, -21, -25],
    },
    {
      name: 'Seed: Paused habit with history',
      description: 'Debug data: paused habit with previous completions.',
      status: 'PAUSED',
      dayOffsets: [-1, -2, -3, -4],
    },
    {
      name: 'Seed: Archived habit with history',
      description: 'Debug data: archived read-only habit with one old completion.',
      status: 'ARCHIVED',
      dayOffsets: [-14],
    },
  ];
}

export async function seedHabitDebugData(
  prisma: PrismaClient,
  userId = DEFAULT_DEBUG_SEED_USER_ID,
): Promise<HabitDebugSeedResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error(`Cannot seed habit debug data because user ${userId} does not exist.`);
  }

  await prisma.habit.deleteMany({
    where: {
      userId,
      name: { in: [...DEBUG_HABIT_SEED_NAMES] },
    },
  });

  const today = getTodayCalendarDate();
  const debugHabits = buildDebugHabits();
  let checkInsCreated = 0;

  for (const debugHabit of debugHabits) {
    const checkInDates = debugHabit.dayOffsets.map((offset) =>
      dateFromOffset(today, offset),
    );
    const startDate = checkInDates.sort()[0] ?? today;
    const habit = await prisma.habit.create({
      data: {
        userId,
        name: debugHabit.name,
        description: debugHabit.description,
        startDate,
        status: debugHabit.status,
      },
    });

    await prisma.checkIn.createMany({
      data: checkInDates.map((date) => ({
        userId,
        habitId: habit.id,
        date,
      })),
    });
    checkInsCreated += checkInDates.length;
  }

  return {
    userId,
    habitsCreated: debugHabits.length,
    checkInsCreated,
  };
}
