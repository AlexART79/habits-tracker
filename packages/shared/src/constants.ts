export const HABIT_STATUSES = ['ACTIVE', 'PAUSED', 'ARCHIVED'] as const;

export type HabitStatus = (typeof HABIT_STATUSES)[number];

export const AUTH_PROVIDERS = ['google', 'github', 'test'] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const MILESTONE_DAYS = [3, 7, 30] as const;

export type MilestoneDay = (typeof MILESTONE_DAYS)[number];

export const DEFAULT_APP_TIMEZONE = 'UTC';

export const WEBSOCKET_EVENTS = {
  milestonesSubscribe: 'milestones.subscribe',
  milestoneReached: 'milestone.reached',
  notificationAck: 'notification.ack',
} as const;

export type WebSocketEventName = (typeof WEBSOCKET_EVENTS)[keyof typeof WEBSOCKET_EVENTS];
