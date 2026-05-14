import type {
  MilestoneReachedMessage,
  NotificationAckMessage,
  ServerWebSocketMessage,
} from '@habit-tracker/shared';
import { WEBSOCKET_EVENTS } from '@habit-tracker/shared';

export function getMilestoneWebSocketUrl(locationValue = window.location): string {
  const protocol = locationValue.protocol === 'https:' ? 'wss:' : 'ws:';

  return `${protocol}//${locationValue.host}/ws`;
}

export function createAckMessage(notificationId: string): string {
  const message: NotificationAckMessage = {
    type: WEBSOCKET_EVENTS.notificationAck,
    payload: { notificationId },
  };

  return JSON.stringify(message);
}

export function createSubscribeMessage(): string {
  return JSON.stringify({
    type: WEBSOCKET_EVENTS.milestonesSubscribe,
    payload: { clientTime: new Date().toISOString() },
  });
}

export function parseServerMessage(message: string): ServerWebSocketMessage | null {
  try {
    const parsed = JSON.parse(message) as unknown;

    if (isMilestoneReachedMessage(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function isMilestoneReachedMessage(message: unknown): message is MilestoneReachedMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const typedMessage = message as {
    type?: unknown;
    payload?: {
      notificationId?: unknown;
      habitId?: unknown;
      habitName?: unknown;
      milestone?: unknown;
      currentStreak?: unknown;
    };
  };

  return (
    typedMessage.type === WEBSOCKET_EVENTS.milestoneReached &&
    Boolean(typedMessage.payload) &&
    typeof typedMessage.payload?.notificationId === 'string' &&
    typeof typedMessage.payload.habitId === 'string' &&
    typeof typedMessage.payload.habitName === 'string' &&
    typeof typedMessage.payload.milestone === 'number' &&
    typeof typedMessage.payload.currentStreak === 'number'
  );
}
