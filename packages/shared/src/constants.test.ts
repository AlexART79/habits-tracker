import { describe, expect, it } from 'vitest';
import {
  AUTH_PROVIDERS,
  DEFAULT_APP_TIMEZONE,
  HABIT_STATUSES,
  MILESTONE_DAYS,
  WEBSOCKET_EVENTS,
} from './constants.js';

describe('shared constants', () => {
  it('centralizes habit statuses and milestone values', () => {
    expect(HABIT_STATUSES).toEqual(['ACTIVE', 'PAUSED', 'ARCHIVED']);
    expect(MILESTONE_DAYS).toEqual([3, 7, 30]);
  });

  it('centralizes supported auth providers', () => {
    expect(AUTH_PROVIDERS).toEqual(['google', 'github', 'test']);
  });

  it('defines the Phase 0 default timezone and WebSocket event names', () => {
    expect(DEFAULT_APP_TIMEZONE).toBe('UTC');
    expect(WEBSOCKET_EVENTS.milestonesSubscribe).toBe('milestones.subscribe');
    expect(WEBSOCKET_EVENTS.milestoneReached).toBe('milestone.reached');
    expect(WEBSOCKET_EVENTS.notificationAck).toBe('notification.ack');
  });
});
