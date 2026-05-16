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
        milestoneNotifications: {
          select: { id: true, milestone: true, acknowledgedAt: true },
        },
      },
    });

    const today = getToday();
    const results: MilestonePayload[] = [];

    for (const habit of habits) {
      const dates = habit.checkIns.map((ci) => ci.date);
      const { currentStreak } = calculateStreaks(dates, today);

      const alreadyTracked = new Set(habit.milestoneNotifications.map((mn) => mn.milestone));
      // pending = unacknowledged notifications to surface (id keyed by milestone)
      const pending = new Map(
        habit.milestoneNotifications
          .filter((mn) => !mn.acknowledgedAt)
          .map((mn) => [mn.milestone, mn.id]),
      );

      for (const milestone of MILESTONES) {
        if (currentStreak >= milestone && !alreadyTracked.has(milestone)) {
          const notification = await this.prisma.milestoneNotification.create({
            data: { habitId: habit.id, milestone },
          });
          pending.set(milestone, notification.id);
        }
      }

      for (const [milestone, notificationId] of pending) {
        results.push({
          notificationId,
          habitId: habit.id,
          habitName: habit.name,
          milestone,
          currentStreak,
        });
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
