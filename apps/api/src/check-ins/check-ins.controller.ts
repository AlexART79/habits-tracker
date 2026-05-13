import { Controller, Delete, Get, Inject, Param, Post, Query, Req } from '@nestjs/common';
import type {
  CheckInListResponse,
  CheckInTodayResponse,
  UndoCheckInResponse,
} from '@habit-tracker/shared';
import { requireSessionUserId, type RequestWithSession } from '../auth/auth-session';
import { CheckInsService } from './check-ins.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest validation metadata needs the DTO class at runtime.
import { ListCheckInsQueryDto } from './dto/list-check-ins-query.dto';

@Controller('habits/:habitId/check-ins')
export class CheckInsController {
  constructor(
    @Inject(CheckInsService) private readonly checkInsService: CheckInsService,
  ) {}

  @Post('today')
  checkInToday(
    @Req() request: RequestWithSession,
    @Param('habitId') habitId: string,
  ): Promise<CheckInTodayResponse> {
    return this.checkInsService.checkInToday(requireSessionUserId(request), habitId);
  }

  @Delete('today')
  undoToday(
    @Req() request: RequestWithSession,
    @Param('habitId') habitId: string,
  ): Promise<UndoCheckInResponse> {
    return this.checkInsService.undoToday(requireSessionUserId(request), habitId);
  }

  @Get()
  listForMonth(
    @Req() request: RequestWithSession,
    @Param('habitId') habitId: string,
    @Query() query: ListCheckInsQueryDto,
  ): Promise<CheckInListResponse> {
    return this.checkInsService.listForMonth(
      requireSessionUserId(request),
      habitId,
      query.month,
    );
  }
}
