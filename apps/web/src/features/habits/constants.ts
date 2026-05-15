import type { HabitStatus } from './types';

export const STATUS_BADGE_CLASSES: Record<HabitStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const FILTER_DEBOUNCE_MS = 300;

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

export const COMPLETION_FILTER_OPTIONS = [
  { value: '', label: 'All habits' },
  { value: 'true', label: 'Done today' },
  { value: 'false', label: 'Not done today' },
] as const;

export const CONFIRM_ARCHIVE = (name: string) =>
  `Archive "${name}"? This cannot be undone.`;

export const CONFIRM_DELETE = (name: string) =>
  `Delete "${name}"? This cannot be undone.`;

export const MODAL_BACKDROP_CLASSES =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4';

export const FORM_FIELD_CLASSES =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export const FORM_LABEL_CLASSES = 'block text-sm font-medium text-gray-700 mb-1';
