import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { TestEnvGuard } from './guards/test-env.guard';
import { Request, Response } from 'express';

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

const mockAuthService = {
  upsertUser: jest.fn().mockResolvedValue(mockUser),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }, TestEnvGuard],
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

  describe('POST /auth/test-login', () => {
    it('calls upsertUser and req.login, returns user', async () => {
      const mockLogin = jest.fn((user: unknown, cb: () => void) => cb());
      const dto = {
        provider: 'test',
        providerUserId: 'test-001',
        email: 'bob@example.com',
        displayName: 'Bob',
      };
      const result = await controller.testLogin(
        dto as any,
        {
          login: mockLogin,
        } as any,
      );
      expect(mockAuthService.upsertUser).toHaveBeenCalledWith({
        provider: 'test',
        providerUserId: 'test-001',
        email: 'bob@example.com',
        displayName: 'Bob',
        avatarUrl: null,
      });
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('OAuth callbacks', () => {
    function createOAuthCallbackMocks() {
      const mockLogin = jest.fn((user: unknown, cb: () => void) => cb());
      const mockSave = jest.fn((cb: () => void) => cb());
      const mockRedirect = jest.fn();
      const req = {
        user: mockUser,
        login: mockLogin,
        session: { save: mockSave },
      } as unknown as Request;
      const res = {
        redirect: mockRedirect,
      } as unknown as Response;

      return { req, res, mockLogin, mockSave, mockRedirect };
    }

    it('logs the Google OAuth user into the session before redirecting', async () => {
      const { req, res, mockLogin, mockSave, mockRedirect } = createOAuthCallbackMocks();

      await controller.googleCallback(req, res);

      expect(mockLogin).toHaveBeenCalledWith(mockUser, expect.any(Function));
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5175');
    });

    it('logs the GitHub OAuth user into the session before redirecting', async () => {
      const { req, res, mockLogin, mockSave, mockRedirect } = createOAuthCallbackMocks();

      await controller.githubCallback(req, res);

      expect(mockLogin).toHaveBeenCalledWith(mockUser, expect.any(Function));
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('http://localhost:5175');
    });
  });
});
