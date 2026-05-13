import type { CompletedTodayFilter, HabitStatusFilter } from './habitTypes';

export const HABIT_FILTER_DEBOUNCE_MS = 300;

export const HABIT_COPY = {
  dashboardAriaLabel: 'Habit dashboard',
  dashboardEyebrow: 'Today',
  dashboardTitle: 'Your habits',
  dashboardDescription: 'Create, review, and tune the routines you are tracking.',
  createHabit: 'Create habit',
  totalHabits: 'Total habits',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
  filters: 'Filters',
  searchLabel: 'Search habits',
  searchPlaceholder: 'Search by name or description',
  statusLabel: 'Status',
  todayLabel: 'Today',
  all: 'All',
  completedToday: 'Completed today',
  notCompletedToday: 'Not completed today',
  clearFilters: 'Clear filters',
  loadingHabits: 'Loading habits...',
  noFilterMatchesTitle: 'No habits match your filters.',
  noFilterMatchesDescription: 'Try a different search term or clear filters to see every habit.',
  noHabitsTitle: 'No habits yet.',
  noHabitsDescription: 'Create your first habit to start tracking progress.',
  archivedReadOnly: 'Archived habits are read-only.',
  currentStreak: 'Current streak',
  bestStreak: 'Best streak',
  totalCheckIns: 'Total check-ins',
  undoToday: 'Undo today',
  checkInToday: 'Check in today',
  pausedCannotCheckIn: 'Paused habits cannot be checked in.',
  archivedCannotCheckIn: 'Archived habits cannot be checked in.',
  confirmArchive: 'Confirm archive',
  confirmDelete: 'Confirm delete',
  cancel: 'Cancel',
  saveHabit: 'Save habit',
  saveChanges: 'Save changes',
  habitName: 'Habit name',
  startDate: 'Start date',
  description: 'Description',
  nameRequired: 'Name is required.',
  currentMonthHistory: 'Current month history',
  loadingCheckIns: 'Loading check-ins...',
  noCheckInsThisMonth: 'No check-ins this month.',
  checkedInDates: 'Checked-in dates',
  unableToLoadHabits: 'Unable to load habits.',
  unableToSaveHabit: 'Unable to save habit.',
  unableToUpdateHabit: 'Unable to update habit.',
  unableToDeleteHabit: 'Unable to delete habit.',
  unableToCheckInHabit: 'Unable to check in habit.',
  unableToUndoCheckIn: 'Unable to undo check-in.',
  unableToLoadCheckIns: 'Unable to load check-ins.',
} as const;

export const HABIT_STATUS_OPTIONS: Array<{ label: string; value: HabitStatusFilter }> = [
  { label: HABIT_COPY.all, value: '' },
  { label: HABIT_COPY.active, value: 'ACTIVE' },
  { label: HABIT_COPY.paused, value: 'PAUSED' },
  { label: HABIT_COPY.archived, value: 'ARCHIVED' },
];

export const COMPLETED_TODAY_OPTIONS: Array<{
  label: string;
  value: CompletedTodayFilter;
}> = [
  { label: HABIT_COPY.all, value: '' },
  { label: HABIT_COPY.completedToday, value: 'true' },
  { label: HABIT_COPY.notCompletedToday, value: 'false' },
];

export const HABIT_LIMITS = {
  nameMaxLength: 120,
  descriptionMaxLength: 500,
} as const;

export const HABIT_ARIA = {
  list: 'Habit list',
  createForm: 'Create habit form',
  editForm: 'Edit habit form',
  checkIn: (name: string) => `Check in ${name}`,
  undoCheckIn: (name: string) => `Undo check-in ${name}`,
  cancelArchive: (name: string) => `Cancel archive ${name}`,
  confirmArchive: (name: string) => `Confirm archive ${name}`,
  confirmDelete: (name: string) => `Confirm delete ${name}`,
  edit: (name: string) => `Edit ${name}`,
  pause: (name: string) => `Pause ${name}`,
  resume: (name: string) => `Resume ${name}`,
  archive: (name: string) => `Archive ${name}`,
  delete: (name: string) => `Delete ${name}`,
  streakSummary: (name: string) => `${name} streak summary`,
  showHistory: (name: string) => `Show check-in history for ${name}`,
  hideHistory: (name: string) => `Hide check-in history for ${name}`,
  currentMonthCheckIns: (name: string) => `${name} current month check-ins`,
} as const;
