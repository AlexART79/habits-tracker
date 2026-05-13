import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthLogoutResponse, AuthMeResponse } from '@habit-tracker/shared';
import type { Response } from 'express';
import type { ProviderProfile } from '../users/users.service';
import { AuthService } from './auth.service';
import { requireSessionUserId, type RequestWithSession } from './auth-session';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest validation metadata needs the DTO class at runtime.
import { TestLoginDto } from './dto/test-login.dto';

type OAuthRequest = RequestWithSession & {
  user: ProviderProfile;
};

function getWebAuthSuccessUrl(): string {
  return process.env.WEB_AUTH_SUCCESS_URL ?? 'http://localhost:5174/';
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  async me(@Req() request: RequestWithSession): Promise<AuthMeResponse> {
    const userId = requireSessionUserId(request);

    return this.authService.getCurrentUser(userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  google(): void {
    return undefined;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() request: OAuthRequest,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.login(request, request.user);
    response.redirect(getWebAuthSuccessUrl());
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  github(): void {
    return undefined;
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() request: OAuthRequest,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.login(request, request.user);
    response.redirect(getWebAuthSuccessUrl());
  }

  @Post('test-login')
  async testLogin(
    @Req() request: RequestWithSession,
    @Body() testLoginDto: TestLoginDto,
  ): Promise<AuthMeResponse> {
    this.authService.assertTestLoginAllowed();

    return this.authService.login(request, {
      provider: testLoginDto.provider,
      providerUserId: testLoginDto.providerUserId,
      email: testLoginDto.email ?? null,
      displayName: testLoginDto.displayName,
      avatarUrl: testLoginDto.avatarUrl ?? null,
    });
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: RequestWithSession): Promise<AuthLogoutResponse> {
    await this.authService.logout(request);

    return { ok: true };
  }
}
