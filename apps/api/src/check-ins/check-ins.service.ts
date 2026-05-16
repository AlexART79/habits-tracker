import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckIn } from '@prisma/client';
import { getToday } from '../streaks/streak.util';
import { MilestoneService } from '../notifications/milestone.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CheckInsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly milestoneService: MilestoneService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private async findHabitOwnedOrThrow(habitId: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException('Access denied');
    return habit;
  }

  async checkInToday(habitId: string, userId: string): Promise<CheckIn> {
    const habit = await this.findHabitOwnedOrThrow(habitId, userId);
    if (habit.status !== 'ACTIVE') {
      throw new BadRequestException('Only active habits can be checked in');
    }
    let checkIn: CheckIn;
    try {
      checkIn = await this.prisma.checkIn.create({
        data: { habitId, date: getToday() },
      });
    } catch (err: unknown) {
      if (
        err !== null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Already checked in today');
      }
      throw err;
    }

    const milestones = await this.milestoneService.evaluateHabitMilestones(userId, habitId);
    this.notificationsGateway.sendMilestonesToUser(userId, milestones);

    return checkIn;
  }

  async undoToday(habitId: string, userId: string): Promise<void> {
    await this.findHabitOwnedOrThrow(habitId, userId);
    const result = await this.prisma.checkIn.deleteMany({
      where: { habitId, date: getToday() },
    });
    if (result.count === 0) {
      throw new NotFoundException('No check-in for today');
    }
  }

  async findByMonth(habitId: string, userId: string, month?: string): Promise<{ dates: string[] }> {
    await this.findHabitOwnedOrThrow(habitId, userId);

    const targetMonth = month ?? getToday().slice(0, 7);

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(targetMonth)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const checkIns = await this.prisma.checkIn.findMany({
      where: { habitId, date: { startsWith: targetMonth + '-' } },
      select: { date: true },
      orderBy: { date: 'asc' },
    });

    return { dates: checkIns.map((ci) => ci.date) };
  }
}
