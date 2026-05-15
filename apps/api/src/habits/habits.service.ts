import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Habit, Prisma } from '@prisma/client';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { GetHabitsQueryDto } from './dto/get-habits-query.dto';
import { calculateStreaks, getToday } from '../streaks/streak.util';

export interface HabitWithStats extends Omit<Habit, never> {
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
  completedToday: boolean;
}

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwnedOrThrow(id: string, userId: string): Promise<Habit> {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException('Access denied');
    return habit;
  }

  async findAllByUser(userId: string, filters?: GetHabitsQueryDto): Promise<HabitWithStats[]> {
    const where: Prisma.HabitWhereInput = { userId };
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    const habits = await this.prisma.habit.findMany({
      where,
      include: {
        checkIns: { select: { date: true }, orderBy: { date: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const today = getToday();
    let result = habits.map(({ checkIns, ...habit }) => {
      const dates = checkIns.map((ci) => ci.date);
      const { currentStreak, bestStreak, total } = calculateStreaks(dates, today);
      return {
        ...habit,
        currentStreak,
        bestStreak,
        totalCheckIns: total,
        completedToday: dates.includes(today),
      };
    });
    if (filters?.completedToday !== undefined) {
      result = result.filter((h) => h.completedToday === filters.completedToday);
    }
    return result;
  }

  async findOne(id: string, userId: string): Promise<HabitWithStats> {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      include: {
        checkIns: { select: { date: true }, orderBy: { date: 'asc' } },
      },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException('Access denied');
    const { checkIns, ...rest } = habit;
    const today = getToday();
    const dates = checkIns.map((ci) => ci.date);
    const { currentStreak, bestStreak, total } = calculateStreaks(dates, today);
    return {
      ...rest,
      currentStreak,
      bestStreak,
      totalCheckIns: total,
      completedToday: dates.includes(today),
    };
  }

  create(userId: string, dto: CreateHabitDto): Promise<Habit> {
    return this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateHabitDto): Promise<Habit> {
    const existing = await this.findOwnedOrThrow(id, userId);
    if (existing.status === 'ARCHIVED') {
      throw new BadRequestException('Archived habits cannot be edited');
    }
    return this.prisma.habit.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwnedOrThrow(id, userId);
    await this.prisma.habit.delete({ where: { id } });
  }
}
