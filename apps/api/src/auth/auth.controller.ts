import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
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
    return { message: 'Logged out' };
  }
}
