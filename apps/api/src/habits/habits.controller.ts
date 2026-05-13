import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type {
  DeleteHabitResponse,
  HabitListResponse,
  HabitResponse,
} from '@habit-tracker/shared';
import { requireSessionUserId, type RequestWithSession } from '../auth/auth-session';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest validation metadata needs the DTO class at runtime.
import { CreateHabitDto } from './dto/create-habit.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest validation metadata needs the DTO class at runtime.
import { ListHabitsQueryDto } from './dto/list-habits-query.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest validation metadata needs the DTO class at runtime.
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
  constructor(@Inject(HabitsService) private readonly habitsService: HabitsService) {}

  @Get()
  list(
    @Req() request: RequestWithSession,
    @Query() query: ListHabitsQueryDto,
  ): Promise<HabitListResponse> {
    return this.habitsService.list(requireSessionUserId(request), query);
  }

  @Post()
  create(
    @Req() request: RequestWithSession,
    @Body() createHabitDto: CreateHabitDto,
  ): Promise<HabitResponse> {
    return this.habitsService.create(requireSessionUserId(request), createHabitDto);
  }

  @Get(':id')
  get(
    @Req() request: RequestWithSession,
    @Param('id') id: string,
  ): Promise<HabitResponse> {
    return this.habitsService.get(requireSessionUserId(request), id);
  }

  @Patch(':id')
  update(
    @Req() request: RequestWithSession,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ): Promise<HabitResponse> {
    return this.habitsService.update(requireSessionUserId(request), id, updateHabitDto);
  }

  @Delete(':id')
  delete(
    @Req() request: RequestWithSession,
    @Param('id') id: string,
  ): Promise<DeleteHabitResponse> {
    return this.habitsService.delete(requireSessionUserId(request), id);
  }
}
