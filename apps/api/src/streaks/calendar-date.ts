export function getAppTimeZone(): string {
  return process.env.APP_TIMEZONE ?? 'UTC';
}

export function getTodayCalendarDate(date = new Date(), timeZone = getAppTimeZone()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format calendar date for timezone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

export function getCurrentCalendarMonth(): string {
  return getTodayCalendarDate().slice(0, 7);
}
