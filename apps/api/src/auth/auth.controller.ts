import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  HttpCode,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { TestEnvGuard } from './guards/test-env.guard';
import { AuthService } from './auth.service';
import { TestLoginDto } from './dto/test-login.dto';
import { CurrentUser } from './decorators/current-user.decorator';

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:5175';

async function persistAuthenticatedSession(req: Request): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedException('OAuth callback did not include an authenticated user');
  }
  const user = req.user;

  await new Promise<void>((resolve, reject) => {
    req.login(user, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve())),
  );
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request): Promise<{ message: string }> {
    await new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return { message: 'Logged out' };
  }

  @UseGuards(TestEnvGuard)
  @Post('test-login')
  @HttpCode(200)
  async testLogin(@Body() dto: TestLoginDto, @Req() req: Request): Promise<User> {
    const user = await this.authService.upsertUser({
      provider: dto.provider,
      providerUserId: dto.providerUserId,
      email: dto.email ?? null,
      displayName: dto.displayName ?? null,
      avatarUrl: null,
    });

    await new Promise<void>((resolve, reject) => {
      req.login(user, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await persistAuthenticatedSession(req);
    res.redirect(FRONTEND_URL);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin(): void {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await persistAuthenticatedSession(req);
    res.redirect(FRONTEND_URL);
  }
}
