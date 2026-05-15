export function toYYYYMM(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function buildCalendarDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return cells;
}

export function parseYYYYMM(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number);
  return { year: y, month: m };
}

export function shiftMonth(ym: string, delta: number): string {
  const { year, month } = parseYYYYMM(ym);
  const d = new Date(year, month - 1 + delta, 1);
  return toYYYYMM(d.getFullYear(), d.getMonth() + 1);
}

export function monthLabel(ym: string): string {
  const { year, month } = parseYYYYMM(ym);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
