import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Controller('habits')
@UseGuards(AuthenticatedGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.habitsService.findAllByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateHabitDto) {
    return this.habitsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.habitsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateHabitDto) {
    return this.habitsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.habitsService.remove(id, user.id);
  }
}
