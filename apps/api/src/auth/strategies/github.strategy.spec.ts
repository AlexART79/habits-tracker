import { Test, TestingModule } from '@nestjs/testing';
import { GitHubStrategy } from './github.strategy';
import { AuthService } from '../auth.service';

const mockUser = {
  id: 'user-github-1',
  provider: 'github',
  providerUserId: '4242',
  email: null,
  displayName: 'octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/4242',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GitHubStrategy', () => {
  let strategy: GitHubStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GitHubStrategy,
          useFactory: (svc: AuthService) =>
            new GitHubStrategy(svc, {
              clientID: 'test-client-id',
              clientSecret: 'test-client-secret',
              callbackURL: 'http://localhost:3002/auth/github/callback',
            }),
          inject: [AuthService],
        },
        {
          provide: AuthService,
          useValue: { upsertUser: jest.fn().mockResolvedValue(mockUser) },
        },
      ],
    }).compile();

    strategy = module.get<GitHubStrategy>(GitHubStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('calls upsertUser with mapped profile fields', async () => {
    const profile = {
      id: '4242',
      displayName: 'octocat',
      username: 'octocat',
      emails: null,
      photos: [{ value: 'https://avatars.githubusercontent.com/u/4242' }],
    };

    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(authService.upsertUser).toHaveBeenCalledWith({
      provider: 'github',
      providerUserId: '4242',
      email: null,
      displayName: 'octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/4242',
    });
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('uses email when GitHub provides it', async () => {
    const profile = {
      id: '9999',
      displayName: 'With Email',
      username: 'withemail',
      emails: [{ value: 'user@example.com' }],
      photos: [],
    };

    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(authService.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' }),
    );
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('falls back to username as displayName when displayName is absent', async () => {
    const profile = {
      id: '1111',
      displayName: null,
      username: 'silent-user',
      emails: null,
      photos: [],
    };

    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(authService.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'silent-user' }),
    );
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('calls done with error when upsertUser throws', async () => {
    const error = new Error('DB error');
    jest.spyOn(authService, 'upsertUser').mockRejectedValueOnce(error);

    const profile = { id: '2222', displayName: 'Err', username: 'err', emails: null, photos: [] };
    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(done).toHaveBeenCalledWith(error);
  });
});
