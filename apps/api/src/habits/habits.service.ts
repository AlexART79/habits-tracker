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
import { PrismaService } from '../prisma/prisma.service';
import type { CreateHabitDto } from './dto/create-habit.dto';
import type { ListHabitsQueryDto } from './dto/list-habits-query.dto';
import type { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListHabitsQueryDto): Promise<HabitListResponse> {
    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return { habits: habits.map((habit) => this.toResponse(habit)) };
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

  private async findOwnedHabitOrThrow(
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

  private assertAllowedKeys(data: object, allowedKeys: string[]): void {
    const allowed = new Set(allowedKeys);
    const unexpectedKey = Object.keys(data).find((key) => !allowed.has(key));

    if (unexpectedKey) {
      throw new BadRequestException(`Unexpected field: ${unexpectedKey}.`);
    }
  }

  private toResponse(habit: Habit): HabitResponse {
    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      startDate: habit.startDate,
      status: habit.status as HabitStatus,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }
}
