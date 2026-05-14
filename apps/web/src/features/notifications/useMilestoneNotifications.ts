import { useEffect, useRef, useState } from 'react';
import type { MilestoneReachedMessage } from '@habit-tracker/shared';
import {
  createAckMessage,
  createSubscribeMessage,
  getMilestoneWebSocketUrl,
  parseServerMessage,
} from './notificationUtils';

type MilestoneNotification = MilestoneReachedMessage['payload'];

export function useMilestoneNotifications() {
  const [notifications, setNotifications] = useState<MilestoneNotification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(getMilestoneWebSocketUrl());
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(createSubscribeMessage());
    };
    socket.onmessage = (event) => {
      const message = parseServerMessage(event.data);

      if (!message) {
        return;
      }

      setNotifications((currentNotifications) => {
        if (
          currentNotifications.some(
            (notification) =>
              notification.notificationId === message.payload.notificationId,
          )
        ) {
          return currentNotifications;
        }

        return [...currentNotifications, message.payload];
      });
    };

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, []);

  function dismissNotification(notificationId: string): void {
    const socket = socketRef.current;

    if (socket) {
      socket.send(createAckMessage(notificationId));
    }

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.notificationId !== notificationId,
      ),
    );
  }

  return { dismissNotification, notifications };
}
