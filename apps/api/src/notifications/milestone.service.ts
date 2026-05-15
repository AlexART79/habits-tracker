import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateStreaks, getToday } from '../streaks/streak.util';

export interface MilestonePayload {
  notificationId: string;
  habitId: string;
  habitName: string;
  milestone: number;
  currentStreak: number;
}

const MILESTONES = [3, 7, 30] as const;

@Injectable()
export class MilestoneService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateMilestones(userId: string): Promise<MilestonePayload[]> {
    const habits = await this.prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        checkIns: { select: { date: true }, orderBy: { date: 'asc' } },
        milestoneNotifications: { select: { milestone: true } },
      },
    });

    const today = getToday();
    const results: MilestonePayload[] = [];

    for (const habit of habits) {
      const dates = habit.checkIns.map((ci) => ci.date);
      const { currentStreak } = calculateStreaks(dates, today);
      const existing = new Set(habit.milestoneNotifications.map((mn) => mn.milestone));

      for (const milestone of MILESTONES) {
        if (currentStreak >= milestone && !existing.has(milestone)) {
          const notification = await this.prisma.milestoneNotification.create({
            data: { habitId: habit.id, milestone },
          });
          results.push({
            notificationId: notification.id,
            habitId: habit.id,
            habitName: habit.name,
            milestone,
            currentStreak,
          });
        }
      }
    }

    return results;
  }

  async acknowledge(notificationId: string): Promise<void> {
    await this.prisma.milestoneNotification.update({
      where: { id: notificationId },
      data: { acknowledgedAt: new Date() },
    });
  }
}
