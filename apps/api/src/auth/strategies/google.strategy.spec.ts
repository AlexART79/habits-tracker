import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../auth.service';

const mockUser = {
  id: 'user-google-1',
  provider: 'google',
  providerUserId: 'google-sub-123',
  email: 'alice@gmail.com',
  displayName: 'Alice',
  avatarUrl: 'https://lh3.googleusercontent.com/photo',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GoogleStrategy,
          useFactory: (svc: AuthService) =>
            new GoogleStrategy(svc, {
              clientID: 'test-client-id',
              clientSecret: 'test-client-secret',
              callbackURL: 'http://localhost:3002/auth/google/callback',
            }),
          inject: [AuthService],
        },
        {
          provide: AuthService,
          useValue: { upsertUser: jest.fn().mockResolvedValue(mockUser) },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('calls upsertUser with mapped profile fields', async () => {
    const profile = {
      id: 'google-sub-123',
      displayName: 'Alice',
      emails: [{ value: 'alice@gmail.com' }],
      photos: [{ value: 'https://lh3.googleusercontent.com/photo' }],
    };

    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(authService.upsertUser).toHaveBeenCalledWith({
      provider: 'google',
      providerUserId: 'google-sub-123',
      email: 'alice@gmail.com',
      displayName: 'Alice',
      avatarUrl: 'https://lh3.googleusercontent.com/photo',
    });
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('handles missing email gracefully', async () => {
    const profile = {
      id: 'google-sub-456',
      displayName: 'No Email',
      emails: [],
      photos: [],
    };

    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(authService.upsertUser).toHaveBeenCalledWith({
      provider: 'google',
      providerUserId: 'google-sub-456',
      email: null,
      displayName: 'No Email',
      avatarUrl: null,
    });
  });

  it('calls done with error when upsertUser throws', async () => {
    const error = new Error('DB error');
    jest.spyOn(authService, 'upsertUser').mockRejectedValueOnce(error);

    const profile = { id: 'google-sub-789', displayName: 'Error User', emails: [], photos: [] };
    const done = jest.fn();
    await strategy.validate('access', 'refresh', profile as any, done);

    expect(done).toHaveBeenCalledWith(error);
  });
});
