import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function daysAgoDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

async function main() {
  const provider = process.env.SEED_USER_PROVIDER;
  const email = process.env.SEED_USER_EMAIL;

  if (!provider || !email) {
    console.error('SEED_USER_PROVIDER and SEED_USER_EMAIL env vars are required.');
    process.exit(1);
  }

  let user = await prisma.user.findFirst({ where: { provider, email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        provider,
        providerUserId: `seed-${provider}-${email}`,
        email,
        displayName: email.split('@')[0],
      },
    });
    console.log(`Created user ${user.id} (${email})`);
    console.log(
      'NOTE: Log in via OAuth first so the seeded user matches your session.\n',
    );
  } else {
    console.log(`Found user ${user.id} (${email})\n`);
  }

  await prisma.habit.deleteMany({ where: { userId: user.id } });

  // Habit 1: Daily Meditation — 35-day streak, no milestone notifications
  // WS connect will trigger milestones 3, 7, and 30
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Daily Meditation',
      description: 'Meditate for at least 10 minutes every day',
      startDate: daysAgoDate(34),
      status: 'ACTIVE',
      checkIns: {
        create: Array.from({ length: 35 }, (_, i) => ({ date: dateStr(34 - i) })),
      },
    },
  });
  console.log('✓ Daily Meditation   streak=35  best=35  total=35  | pending milestones: 3, 7, 30');

  // Habit 2: Morning Run — 7-day streak, milestone 3 already acknowledged
  // WS connect will trigger milestone 7
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Morning Run',
      description: 'Run at least 2km every morning',
      startDate: daysAgoDate(6),
      status: 'ACTIVE',
      checkIns: {
        create: Array.from({ length: 7 }, (_, i) => ({ date: dateStr(6 - i) })),
      },
      milestoneNotifications: {
        create: [{ milestone: 3, sentAt: daysAgoDate(3), acknowledgedAt: daysAgoDate(2) }],
      },
    },
  });
  console.log('✓ Morning Run        streak=7   best=7   total=7   | pending milestones: 7');

  // Habit 3: Read 30 Minutes — 3-day streak, no milestone notifications
  // WS connect will trigger milestone 3
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Read 30 Minutes',
      description: 'Read a book for at least 30 minutes',
      startDate: daysAgoDate(2),
      status: 'ACTIVE',
      checkIns: {
        create: [{ date: dateStr(2) }, { date: dateStr(1) }, { date: dateStr(0) }],
      },
    },
  });
  console.log('✓ Read 30 Minutes    streak=3   best=3   total=3   | pending milestones: 3');

  // Habit 4: Learn Spanish — bestStreak=14, currentStreak=2
  // Old 14-day run (days 72–59 ago), then gap, then 2-day current streak
  // Both milestones 3 and 7 acknowledged from the old run
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Learn Spanish',
      description: 'Practice Spanish for 20 minutes daily',
      startDate: daysAgoDate(72),
      status: 'ACTIVE',
      checkIns: {
        create: [
          ...Array.from({ length: 14 }, (_, i) => ({ date: dateStr(72 - i) })),
          { date: dateStr(1) },
          { date: dateStr(0) },
        ],
      },
      milestoneNotifications: {
        create: [
          { milestone: 3, sentAt: daysAgoDate(69), acknowledgedAt: daysAgoDate(68) },
          { milestone: 7, sentAt: daysAgoDate(65), acknowledgedAt: daysAgoDate(64) },
        ],
      },
    },
  });
  console.log('✓ Learn Spanish      streak=2   best=14  total=16  | no pending milestones');

  // Habit 5: Drink 2L Water — PAUSED, 5-day best streak 34–38 days ago + scattered check-ins
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Drink 2L Water',
      description: 'Stay hydrated with at least 2 liters of water',
      startDate: daysAgoDate(38),
      status: 'PAUSED',
      checkIns: {
        create: [
          ...Array.from({ length: 5 }, (_, i) => ({ date: dateStr(38 - i) })),
          { date: dateStr(25) },
          { date: dateStr(22) },
          { date: dateStr(10) },
        ],
      },
      milestoneNotifications: {
        create: [{ milestone: 3, sentAt: daysAgoDate(35), acknowledgedAt: daysAgoDate(34) }],
      },
    },
  });
  console.log('✓ Drink 2L Water     streak=0   best=5   total=8   | PAUSED, no pending milestones');

  // Habit 6: Journaling — 2-day streak ending yesterday (no check-in today)
  // One more day needed to hit milestone 3
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Journaling',
      description: 'Write in a journal every day',
      startDate: daysAgoDate(1),
      status: 'ACTIVE',
      checkIns: {
        create: [{ date: dateStr(2) }, { date: dateStr(1) }],
      },
    },
  });
  console.log('✓ Journaling         streak=2   best=2   total=2   | no today check-in, 1 day from milestone 3');

  // Habit 7: Cold Shower — 6-day streak ending yesterday (no check-in today)
  // One more day needed to hit milestone 7
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Cold Shower',
      description: 'Take a cold shower every morning',
      startDate: daysAgoDate(5),
      status: 'ACTIVE',
      checkIns: {
        create: Array.from({ length: 6 }, (_, i) => ({ date: dateStr(6 - i) })),
      },
      milestoneNotifications: {
        create: [{ milestone: 3, sentAt: daysAgoDate(3), acknowledgedAt: daysAgoDate(2) }],
      },
    },
  });
  console.log('✓ Cold Shower        streak=6   best=6   total=6   | no today check-in, 1 day from milestone 7');

  // Habit 8: No Social Media — 29-day streak ending yesterday (no check-in today)
  // One more day needed to hit milestone 30
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'No Social Media',
      description: 'Avoid social media for the whole day',
      startDate: daysAgoDate(28),
      status: 'ACTIVE',
      checkIns: {
        create: Array.from({ length: 29 }, (_, i) => ({ date: dateStr(29 - i) })),
      },
      milestoneNotifications: {
        create: [
          { milestone: 3, sentAt: daysAgoDate(26), acknowledgedAt: daysAgoDate(25) },
          { milestone: 7, sentAt: daysAgoDate(22), acknowledgedAt: daysAgoDate(21) },
        ],
      },
    },
  });
  console.log('✓ No Social Media    streak=29  best=29  total=29  | no today check-in, 1 day from milestone 30');

  console.log('\nDone. Connect via WebSocket to receive 5 milestone notifications:');
  console.log('  Daily Meditation → 3, 7, 30');
  console.log('  Morning Run      → 7');
  console.log('  Read 30 Minutes  → 3');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
