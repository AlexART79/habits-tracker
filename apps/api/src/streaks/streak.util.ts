export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function subtractDay(date: string): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

function isConsecutive(earlier: string, later: string): boolean {
  return subtractDay(later) === earlier;
}

export function calculateStreaks(
  sortedDates: string[],
  today: string,
): { currentStreak: number; bestStreak: number; total: number } {
  const total = sortedDates.length;
  if (total === 0) return { currentStreak: 0, bestStreak: 0, total: 0 };

  const dateSet = new Set(sortedDates);
  const yesterday = subtractDay(today);

  let currentStreak = 0;
  const startDate = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;

  if (startDate) {
    let cursor = startDate;
    while (dateSet.has(cursor)) {
      currentStreak++;
      cursor = subtractDay(cursor);
    }
  }

  let bestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (isConsecutive(sortedDates[i - 1], sortedDates[i])) {
      run++;
    } else {
      bestStreak = Math.max(bestStreak, run);
      run = 1;
    }
  }
  bestStreak = Math.max(bestStreak, run, currentStreak);

  return { currentStreak, bestStreak, total };
}
