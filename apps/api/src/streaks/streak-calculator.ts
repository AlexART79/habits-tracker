export type StreakSummary = {
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseCalendarDate(date: string): number {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!yearText || !monthText || !dayText) {
    throw new Error(`Invalid calendar date: ${date}`);
  }

  return Date.UTC(year, month - 1, day);
}

function previousDate(date: string): string {
  return new Date(parseCalendarDate(date) - DAY_IN_MS).toISOString().slice(0, 10);
}

function isNextCalendarDate(previous: string, next: string): boolean {
  return parseCalendarDate(next) - parseCalendarDate(previous) === DAY_IN_MS;
}

export function calculateStreakSummary(
  checkInDates: string[],
  today: string,
): StreakSummary {
  const dates = [...new Set(checkInDates)].sort();
  let bestStreak = 0;
  let runLength = 0;
  let previous: string | null = null;

  for (const date of dates) {
    runLength = previous && isNextCalendarDate(previous, date) ? runLength + 1 : 1;
    bestStreak = Math.max(bestStreak, runLength);
    previous = date;
  }

  const dateSet = new Set(dates);
  let currentStreak = 0;
  let cursor = today;

  while (dateSet.has(cursor)) {
    currentStreak += 1;
    cursor = previousDate(cursor);
  }

  return {
    currentStreak,
    bestStreak,
    totalCheckIns: dateSet.size,
  };
}
