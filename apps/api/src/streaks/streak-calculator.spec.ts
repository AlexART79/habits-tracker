import { describe, expect, it } from 'vitest';
import { calculateStreakSummary } from './streak-calculator';

describe('calculateStreakSummary', () => {
  it('returns zero metrics when there are no check-ins', () => {
    expect(calculateStreakSummary([], '2026-05-14')).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      totalCheckIns: 0,
    });
  });

  it('counts a single check-in today as a one-day current and best streak', () => {
    expect(calculateStreakSummary(['2026-05-14'], '2026-05-14')).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      totalCheckIns: 1,
    });
  });

  it('counts consecutive dates ending today as the current streak', () => {
    expect(
      calculateStreakSummary(['2026-05-12', '2026-05-13', '2026-05-14'], '2026-05-14'),
    ).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      totalCheckIns: 3,
    });
  });

  it('resets the current streak when yesterday is missing', () => {
    expect(
      calculateStreakSummary(['2026-05-10', '2026-05-11', '2026-05-14'], '2026-05-14'),
    ).toEqual({
      currentStreak: 1,
      bestStreak: 2,
      totalCheckIns: 3,
    });
  });

  it('keeps the historical best streak when today starts a shorter streak', () => {
    expect(
      calculateStreakSummary(
        ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-10', '2026-05-14'],
        '2026-05-14',
      ),
    ).toEqual({
      currentStreak: 1,
      bestStreak: 3,
      totalCheckIns: 5,
    });
  });

  it('returns a zero current streak after today is undone', () => {
    expect(calculateStreakSummary(['2026-05-12', '2026-05-13'], '2026-05-14')).toEqual({
      currentStreak: 0,
      bestStreak: 2,
      totalCheckIns: 2,
    });
  });

  it.each([
    { days: 3, today: '2026-05-14', dates: ['2026-05-12', '2026-05-13', '2026-05-14'] },
    {
      days: 7,
      today: '2026-05-14',
      dates: [
        '2026-05-08',
        '2026-05-09',
        '2026-05-10',
        '2026-05-11',
        '2026-05-12',
        '2026-05-13',
        '2026-05-14',
      ],
    },
    {
      days: 30,
      today: '2026-05-30',
      dates: Array.from({ length: 30 }, (_, index) => {
        const day = String(index + 1).padStart(2, '0');
        return `2026-05-${day}`;
      }),
    },
  ])('calculates a $days-day milestone streak', ({ days, today, dates }) => {
    expect(calculateStreakSummary(dates, today).currentStreak).toBe(days);
  });
});
