import { calculateStreaks, subtractDay } from './streak.util';

function daysBack(n: number, from: string): string {
  let d = from;
  for (let i = 0; i < n; i++) d = subtractDay(d);
  return d;
}

function consecutiveDates(n: number, endingOn: string): string[] {
  const dates: string[] = [];
  let d = endingOn;
  for (let i = 0; i < n; i++) {
    dates.unshift(d);
    d = subtractDay(d);
  }
  return dates;
}

const TODAY = '2026-05-15';

describe('calculateStreaks', () => {
  it('returns zeros when no check-ins', () => {
    expect(calculateStreaks([], TODAY)).toEqual({ currentStreak: 0, bestStreak: 0, total: 0 });
  });

  it('returns current streak of 1 for today only', () => {
    expect(calculateStreaks([TODAY], TODAY)).toEqual({ currentStreak: 1, bestStreak: 1, total: 1 });
  });

  it('returns current streak of 1 for yesterday only', () => {
    const yesterday = subtractDay(TODAY);
    expect(calculateStreaks([yesterday], TODAY)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      total: 1,
    });
  });

  it('returns 0 current streak when last check-in is 2+ days ago', () => {
    const twoDaysAgo = daysBack(2, TODAY);
    expect(calculateStreaks([twoDaysAgo], TODAY)).toEqual({
      currentStreak: 0,
      bestStreak: 1,
      total: 1,
    });
  });

  it('returns current streak of 3 for today and previous 2 days', () => {
    const dates = consecutiveDates(3, TODAY);
    expect(calculateStreaks(dates, TODAY)).toEqual({ currentStreak: 3, bestStreak: 3, total: 3 });
  });

  it('resets current streak when yesterday is missing', () => {
    const threeDaysAgo = daysBack(3, TODAY);
    const twoDaysAgo = daysBack(2, TODAY);
    expect(calculateStreaks([threeDaysAgo, twoDaysAgo], TODAY)).toEqual({
      currentStreak: 0,
      bestStreak: 2,
      total: 2,
    });
  });

  it('preserves best streak after current drops', () => {
    const oldRun = consecutiveDates(5, daysBack(10, TODAY));
    const recent = [subtractDay(TODAY)];
    const sorted = [...oldRun, ...recent];
    const result = calculateStreaks(sorted, TODAY);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(5);
  });

  it('3-day consecutive fixture', () => {
    const dates = consecutiveDates(3, TODAY);
    const r = calculateStreaks(dates, TODAY);
    expect(r.currentStreak).toBe(3);
    expect(r.bestStreak).toBe(3);
    expect(r.total).toBe(3);
  });

  it('7-day consecutive fixture', () => {
    const dates = consecutiveDates(7, TODAY);
    const r = calculateStreaks(dates, TODAY);
    expect(r.currentStreak).toBe(7);
    expect(r.bestStreak).toBe(7);
    expect(r.total).toBe(7);
  });

  it('30-day consecutive fixture', () => {
    const dates = consecutiveDates(30, TODAY);
    const r = calculateStreaks(dates, TODAY);
    expect(r.currentStreak).toBe(30);
    expect(r.bestStreak).toBe(30);
    expect(r.total).toBe(30);
  });

  it('total reflects all check-ins including gaps', () => {
    const dates = [daysBack(10, TODAY), daysBack(5, TODAY), TODAY];
    const r = calculateStreaks(dates, TODAY);
    expect(r.total).toBe(3);
    expect(r.currentStreak).toBe(1);
  });
});
