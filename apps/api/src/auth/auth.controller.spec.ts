import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedGuard } from './guards/authenticated.guard';

const mockUser = {
  id: 'user-1',
  provider: 'google',
  providerUserId: 'g-001',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: {} }],
    })
      .overrideGuard(AuthenticatedGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          return req.user != null;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('GET /auth/me', () => {
    it('returns the authenticated user', () => {
      const result = controller.me(mockUser as any);
      expect(result).toEqual(mockUser);
    });
  });

  describe('POST /auth/logout', () => {
    it('calls req.logout and returns success', async () => {
      const mockLogout = jest.fn((cb: () => void) => cb());
      const mockDestroy = jest.fn((cb: () => void) => cb());
      const result = await controller.logout({
        logout: mockLogout,
        session: { destroy: mockDestroy },
      } as any);
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockDestroy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
