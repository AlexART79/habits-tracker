import { Test } from '@nestjs/testing';
import { MilestoneService } from './milestone.service';
import { PrismaService } from '../prisma/prisma.service';
import * as streakUtil from '../streaks/streak.util';

const mockPrisma = {
  habit: { findMany: jest.fn() },
  milestoneNotification: { create: jest.fn(), update: jest.fn() },
};

function makeHabit(overrides: {
  id?: string;
  name?: string;
  dates?: string[];
  existingMilestones?: number[];
}) {
  return {
    id: overrides.id ?? 'habit-1',
    name: overrides.name ?? 'Run',
    checkIns: (overrides.dates ?? []).map((date) => ({ date })),
    milestoneNotifications: (overrides.existingMilestones ?? []).map((milestone) => ({
      milestone,
    })),
  };
}

describe('MilestoneService', () => {
  let service: MilestoneService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MilestoneService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get(MilestoneService);
    jest.clearAllMocks();
  });

  describe('evaluateMilestones', () => {
    it('returns empty array when no active habits', async () => {
      mockPrisma.habit.findMany.mockResolvedValue([]);
      const result = await service.evaluateMilestones('user-1');
      expect(result).toEqual([]);
      expect(mockPrisma.milestoneNotification.create).not.toHaveBeenCalled();
    });

    it('creates 3-day notification when streak is exactly 3', async () => {
      jest.spyOn(streakUtil, 'getToday').mockReturnValue('2026-05-15');
      mockPrisma.habit.findMany.mockResolvedValue([
        makeHabit({ dates: ['2026-05-13', '2026-05-14', '2026-05-15'] }),
      ]);
      mockPrisma.milestoneNotification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.evaluateMilestones('user-1');

      expect(mockPrisma.milestoneNotification.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.milestoneNotification.create).toHaveBeenCalledWith({
        data: { habitId: 'habit-1', milestone: 3 },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ milestone: 3, currentStreak: 3 });
    });

    it('creates 3-day and 7-day notifications when streak is 7', async () => {
      jest.spyOn(streakUtil, 'getToday').mockReturnValue('2026-05-15');
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date('2026-05-09');
        d.setUTCDate(d.getUTCDate() + i);
        return d.toISOString().split('T')[0];
      });
      mockPrisma.habit.findMany.mockResolvedValue([makeHabit({ dates })]);
      mockPrisma.milestoneNotification.create
        .mockResolvedValueOnce({ id: 'notif-3' })
        .mockResolvedValueOnce({ id: 'notif-7' });

      const result = await service.evaluateMilestones('user-1');

      expect(mockPrisma.milestoneNotification.create).toHaveBeenCalledTimes(2);
      expect(result.map((r) => r.milestone)).toEqual([3, 7]);
    });

    it('skips already-existing milestones', async () => {
      jest.spyOn(streakUtil, 'getToday').mockReturnValue('2026-05-15');
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date('2026-05-09');
        d.setUTCDate(d.getUTCDate() + i);
        return d.toISOString().split('T')[0];
      });
      mockPrisma.habit.findMany.mockResolvedValue([makeHabit({ dates, existingMilestones: [3] })]);
      mockPrisma.milestoneNotification.create.mockResolvedValue({ id: 'notif-7' });

      const result = await service.evaluateMilestones('user-1');

      expect(mockPrisma.milestoneNotification.create).toHaveBeenCalledTimes(1);
      expect(result[0].milestone).toBe(7);
    });

    it('returns empty when streak is below all milestones', async () => {
      jest.spyOn(streakUtil, 'getToday').mockReturnValue('2026-05-15');
      mockPrisma.habit.findMany.mockResolvedValue([
        makeHabit({ dates: ['2026-05-14', '2026-05-15'] }),
      ]);

      const result = await service.evaluateMilestones('user-1');
      expect(result).toEqual([]);
      expect(mockPrisma.milestoneNotification.create).not.toHaveBeenCalled();
    });
  });

  describe('acknowledge', () => {
    it('calls prisma update with acknowledgedAt', async () => {
      mockPrisma.milestoneNotification.update.mockResolvedValue({});
      await service.acknowledge('notif-1');
      expect(mockPrisma.milestoneNotification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { acknowledgedAt: expect.any(Date) as Date },
      });
    });
  });
});
