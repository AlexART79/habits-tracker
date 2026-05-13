import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type {
  CheckInListResponse,
  CheckInResponse,
  CheckInTodayResponse,
  UndoCheckInResponse,
} from '@habit-tracker/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getTodayCalendarDate } from '../streaks/calendar-date';
import { HabitsService } from '../habits/habits.service';

@Injectable()
export class CheckInsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(HabitsService) private readonly habitsService: HabitsService,
  ) {}

  async checkInToday(userId: string, habitId: string): Promise<CheckInTodayResponse> {
    const habit = await this.habitsService.findOwnedHabitOrThrow(userId, habitId);

    if (habit.status !== 'ACTIVE') {
      throw new ConflictException('Only active habits can receive check-ins.');
    }

    const today = getTodayCalendarDate();

    try {
      const checkIn = await this.prisma.checkIn.create({
        data: { userId, habitId, date: today },
      });

      return {
        checkIn: this.toResponse(checkIn),
        habit: await this.habitsService.get(userId, habitId),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Habit is already checked in for today.');
      }

      throw error;
    }
  }

  async undoToday(userId: string, habitId: string): Promise<UndoCheckInResponse> {
    await this.habitsService.findOwnedHabitOrThrow(userId, habitId);
    const today = getTodayCalendarDate();
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { habitId_date: { habitId, date: today } },
    });

    if (!checkIn) {
      throw new NotFoundException('Today check-in not found.');
    }

    if (checkIn.userId !== userId) {
      throw new NotFoundException('Today check-in not found.');
    }

    await this.prisma.checkIn.delete({ where: { id: checkIn.id } });

    return {
      ok: true,
      habit: await this.habitsService.get(userId, habitId),
    };
  }

  async listForMonth(
    userId: string,
    habitId: string,
    month: string,
  ): Promise<CheckInListResponse> {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Month must use YYYY-MM format.');
    }

    await this.habitsService.findOwnedHabitOrThrow(userId, habitId);
    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        userId,
        habitId,
        date: {
          gte: `${month}-01`,
          lt: this.nextMonth(month),
        },
      },
      orderBy: { date: 'asc' },
    });

    return { checkIns: checkIns.map((checkIn) => this.toResponse(checkIn)) };
  }

  private nextMonth(month: string): string {
    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthNumber = Number(monthText);

    if (!yearText || !monthText) {
      throw new BadRequestException('Month must use YYYY-MM format.');
    }

    const next = new Date(Date.UTC(year, monthNumber, 1));

    return next.toISOString().slice(0, 7) + '-01';
  }

  private toResponse(checkIn: {
    id: string;
    habitId: string;
    date: string;
    createdAt: Date;
  }): CheckInResponse {
    return {
      id: checkIn.id,
      habitId: checkIn.habitId,
      date: checkIn.date,
      createdAt: checkIn.createdAt.toISOString(),
    };
  }
}
