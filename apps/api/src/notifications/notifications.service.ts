import { Inject, Injectable } from '@nestjs/common';
import type {
  MilestoneDay,
  MilestoneReachedMessage,
} from '@habit-tracker/shared';
import { MILESTONE_DAYS, WEBSOCKET_EVENTS } from '@habit-tracker/shared';
import type { Habit, MilestoneNotification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getTodayCalendarDate } from '../streaks/calendar-date';
import { calculateStreakSummary } from '../streaks/streak-calculator';

type HabitWithCheckIns = Habit & {
  checkIns: { date: string }[];
};

@Injectable()
export class NotificationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async evaluateMilestones(userId: string): Promise<MilestoneReachedMessage[]> {
    const habits = await this.prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { checkIns: { where: { userId }, orderBy: { date: 'asc' } } },
    });

    const messages: MilestoneReachedMessage[] = [];

    for (const habit of habits) {
      const message = await this.evaluateHabitMilestone(userId, habit);

      if (message) {
        messages.push(message);
      }
    }

    return messages;
  }

  async acknowledge(userId: string, notificationId: string): Promise<void> {
    await this.prisma.milestoneNotification.updateMany({
      where: { id: notificationId, userId },
      data: { acknowledgedAt: new Date() },
    });
  }

  private async evaluateHabitMilestone(
    userId: string,
    habit: HabitWithCheckIns,
  ): Promise<MilestoneReachedMessage | null> {
    const summary = calculateStreakSummary(
      habit.checkIns.map((checkIn) => checkIn.date),
      getTodayCalendarDate(),
    );
    const milestone = this.findReachedMilestone(summary.currentStreak);

    if (!milestone) {
      return null;
    }

    const existing = await this.prisma.milestoneNotification.findUnique({
      where: { habitId_milestone: { habitId: habit.id, milestone } },
    });

    if (existing) {
      return null;
    }

    const notification = await this.prisma.milestoneNotification.create({
      data: { userId, habitId: habit.id, milestone },
    });

    return this.toMilestoneMessage(habit, notification, milestone, summary.currentStreak);
  }

  private findReachedMilestone(currentStreak: number): MilestoneDay | null {
    return (
      MILESTONE_DAYS.find((milestone) => milestone === currentStreak) ?? null
    );
  }

  private toMilestoneMessage(
    habit: Habit,
    notification: MilestoneNotification,
    milestone: MilestoneDay,
    currentStreak: number,
  ): MilestoneReachedMessage {
    return {
      type: WEBSOCKET_EVENTS.milestoneReached,
      payload: {
        notificationId: notification.id,
        habitId: habit.id,
        habitName: habit.name,
        milestone,
        currentStreak,
      },
    };
  }
}
