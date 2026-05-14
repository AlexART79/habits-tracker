import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('upsertUser', () => {
    it('creates a new user on first call', async () => {
      const user = await service.upsertUser({
        provider: 'google',
        providerUserId: 'google-001',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: 'https://example.com/alice.jpg',
      });

      expect(user.id).toBeDefined();
      expect(user.provider).toBe('google');
      expect(user.providerUserId).toBe('google-001');
      expect(user.email).toBe('alice@example.com');
      expect(user.displayName).toBe('Alice');
      expect(user.avatarUrl).toBe('https://example.com/alice.jpg');
    });

    it('returns the same user on repeated calls with the same provider+providerUserId', async () => {
      const first = await service.upsertUser({
        provider: 'google',
        providerUserId: 'google-001',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: null,
      });
      const second = await service.upsertUser({
        provider: 'google',
        providerUserId: 'google-001',
        email: 'alice@example.com',
        displayName: 'Alice Updated',
        avatarUrl: null,
      });

      expect(second.id).toBe(first.id);
      expect(second.displayName).toBe('Alice Updated');
    });

    it('treats same providerUserId from different providers as separate accounts', async () => {
      const googleUser = await service.upsertUser({
        provider: 'google',
        providerUserId: 'shared-id-42',
        email: 'g@example.com',
        displayName: 'Google User',
        avatarUrl: null,
      });
      const githubUser = await service.upsertUser({
        provider: 'github',
        providerUserId: 'shared-id-42',
        email: 'gh@example.com',
        displayName: 'GitHub User',
        avatarUrl: null,
      });

      expect(googleUser.id).not.toBe(githubUser.id);
    });

    it('works when optional fields are null', async () => {
      const user = await service.upsertUser({
        provider: 'github',
        providerUserId: 'gh-no-email',
        email: null,
        displayName: null,
        avatarUrl: null,
      });

      expect(user.email).toBeNull();
      expect(user.displayName).toBeNull();
    });
  });
});
