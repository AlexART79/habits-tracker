import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type {
  DeleteHabitResponse,
  HabitListResponse,
  HabitResponse,
  HabitStatus,
} from '@habit-tracker/shared';
import { HABIT_STATUSES } from '@habit-tracker/shared';
import type { Habit } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getTodayCalendarDate } from '../streaks/calendar-date';
import { calculateStreakSummary } from '../streaks/streak-calculator';
import type { CreateHabitDto } from './dto/create-habit.dto';
import type { ListHabitsQueryDto } from './dto/list-habits-query.dto';
import type { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListHabitsQueryDto): Promise<HabitListResponse> {
    const completedToday = this.normalizeCompletedToday(query.completedToday);

    if (query.status && !HABIT_STATUSES.includes(query.status)) {
      throw new BadRequestException('Habit status is invalid.');
    }

    if (
      completedToday !== undefined &&
      query.status !== undefined &&
      query.status !== 'ACTIVE'
    ) {
      throw new BadRequestException(
        'Today completion filter can only be used with active habits.',
      );
    }

    const today = getTodayCalendarDate();
    const where: Prisma.HabitWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(completedToday !== undefined
        ? {
            status: 'ACTIVE',
            checkIns: completedToday
              ? { some: { userId, date: today } }
              : { none: { userId, date: today } },
          }
        : {}),
    };

    const habits = await this.prisma.habit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { habits: await this.toResponses(habits) };
  }

  async create(userId: string, dto: CreateHabitDto): Promise<HabitResponse> {
    this.assertAllowedKeys(dto, ['name', 'description', 'startDate']);
    const name = this.normalizeName(dto.name);
    const habit = await this.prisma.habit.create({
      data: {
        userId,
        name,
        description: this.normalizeDescription(dto.description),
        startDate: dto.startDate,
        status: 'ACTIVE',
      },
    });

    return this.toResponse(habit);
  }

  async get(userId: string, habitId: string): Promise<HabitResponse> {
    return this.toResponse(await this.findOwnedHabitOrThrow(userId, habitId));
  }

  async update(
    userId: string,
    habitId: string,
    dto: UpdateHabitDto,
  ): Promise<HabitResponse> {
    this.assertAllowedKeys(dto, ['name', 'description', 'startDate', 'status']);
    const habit = await this.findOwnedHabitOrThrow(userId, habitId);

    if (habit.status === 'ARCHIVED') {
      throw new ConflictException('Archived habits are read-only.');
    }

    const updated = await this.prisma.habit.update({
      where: { id: habit.id },
      data: {
        ...(dto.name !== undefined ? { name: this.normalizeName(dto.name) } : {}),
        ...(dto.description !== undefined
          ? { description: this.normalizeDescription(dto.description) }
          : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.status !== undefined ? { status: this.normalizeStatus(dto.status) } : {}),
      },
    });

    return this.toResponse(updated);
  }

  async delete(userId: string, habitId: string): Promise<DeleteHabitResponse> {
    const habit = await this.findOwnedHabitOrThrow(userId, habitId);

    await this.prisma.habit.delete({ where: { id: habit.id } });

    return { ok: true };
  }

  async findOwnedHabitOrThrow(
    userId: string,
    habitId: string,
  ): Promise<Habit> {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });

    if (!habit) {
      throw new NotFoundException('Habit not found.');
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException('Habit belongs to another user.');
    }

    return habit;
  }

  private normalizeDescription(description: string | null | undefined): string | null {
    if (description === undefined || description === null) {
      return null;
    }

    const trimmedDescription = description.trim();

    return trimmedDescription === '' ? null : trimmedDescription;
  }

  private normalizeName(name: string): string {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new BadRequestException('Habit name is required.');
    }

    return trimmedName;
  }

  private normalizeStatus(status: HabitStatus): HabitStatus {
    if (!HABIT_STATUSES.includes(status)) {
      throw new BadRequestException('Habit status is invalid.');
    }

    return status;
  }

  private normalizeCompletedToday(completedToday: unknown): boolean | undefined {
    if (completedToday === undefined) {
      return undefined;
    }

    if (completedToday === true || completedToday === 'true') {
      return true;
    }

    if (completedToday === false || completedToday === 'false') {
      return false;
    }

    throw new BadRequestException('Today completion filter must be true or false.');
  }

  private assertAllowedKeys(data: object, allowedKeys: string[]): void {
    const allowed = new Set(allowedKeys);
    const unexpectedKey = Object.keys(data).find((key) => !allowed.has(key));

    if (unexpectedKey) {
      throw new BadRequestException(`Unexpected field: ${unexpectedKey}.`);
    }
  }

  private async toResponses(habits: Habit[]): Promise<HabitResponse[]> {
    if (habits.length === 0) {
      return [];
    }

    const firstHabit = habits[0];
    if (!firstHabit) {
      return [];
    }

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        userId: firstHabit.userId,
        habitId: { in: habits.map((habit) => habit.id) },
      },
      orderBy: { date: 'asc' },
    });
    const datesByHabitId = new Map<string, string[]>();

    for (const checkIn of checkIns) {
      const dates = datesByHabitId.get(checkIn.habitId) ?? [];
      dates.push(checkIn.date);
      datesByHabitId.set(checkIn.habitId, dates);
    }

    return habits.map((habit) =>
      this.toResponseFromDates(habit, datesByHabitId.get(habit.id) ?? []),
    );
  }

  private async toResponse(habit: Habit): Promise<HabitResponse> {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId: habit.userId, habitId: habit.id },
      orderBy: { date: 'asc' },
    });

    return this.toResponseFromDates(
      habit,
      checkIns.map((checkIn) => checkIn.date),
    );
  }

  private toResponseFromDates(habit: Habit, checkInDates: string[]): HabitResponse {
    const today = getTodayCalendarDate();
    const summary = calculateStreakSummary(checkInDates, today);

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      startDate: habit.startDate,
      status: habit.status as HabitStatus,
      ...summary,
      completedToday: checkInDates.includes(today),
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }
}
