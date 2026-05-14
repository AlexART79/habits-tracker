import type { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.milestoneNotification.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();
}
