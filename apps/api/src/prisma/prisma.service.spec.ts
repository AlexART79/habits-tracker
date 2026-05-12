import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects and disconnects through Nest lifecycle hooks', async () => {
    const prisma = new PrismaService();

    await expect(prisma.onModuleInit()).resolves.toBeUndefined();
    await expect(prisma.user.count()).resolves.toBe(0);
    await expect(prisma.onModuleDestroy()).resolves.toBeUndefined();
  });
});
