import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_DEBUG_SEED_USER_ID,
  seedHabitDebugData,
} from './seed/habitDebugData';

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const userId = process.env.SEED_USER_ID ?? DEFAULT_DEBUG_SEED_USER_ID;

  try {
    const result = await seedHabitDebugData(prisma, userId);

    console.log(
      `Seeded ${result.habitsCreated} habits and ${result.checkInsCreated} check-ins for user ${result.userId}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exitCode = 1;
});
