import { Controller, Post, Delete, Get, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckInsService } from './check-ins.service';

@Controller('habits/:habitId/check-ins')
@UseGuards(AuthenticatedGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post('today')
  @HttpCode(201)
  checkInToday(@CurrentUser() user: User, @Param('habitId') habitId: string) {
    return this.checkInsService.checkInToday(habitId, user.id);
  }

  @Delete('today')
  @HttpCode(204)
  undoToday(@CurrentUser() user: User, @Param('habitId') habitId: string) {
    return this.checkInsService.undoToday(habitId, user.id);
  }

  @Get()
  findByMonth(
    @CurrentUser() user: User,
    @Param('habitId') habitId: string,
    @Query('month') month?: string,
  ) {
    return this.checkInsService.findByMonth(habitId, user.id, month);
  }
}
