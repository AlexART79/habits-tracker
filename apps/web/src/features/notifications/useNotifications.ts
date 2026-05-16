import { useCallback, useEffect, useRef, useState } from 'react';
import type { MilestoneReachedPayload } from './types';

interface ServerMessage {
  type: string;
  payload?: MilestoneReachedPayload;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<MilestoneReachedPayload[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          type: 'milestones.subscribe',
          payload: { clientTime: new Date().toISOString() },
        }),
      );
    });

    socket.addEventListener('message', (event: MessageEvent<string>) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        return;
      }
      if (msg.type === 'milestone.reached' && msg.payload) {
        setNotifications((prev) =>
          prev.some((n) => n.notificationId === msg.payload!.notificationId)
            ? prev
            : [...prev, msg.payload!],
        );
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const acknowledge = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    socketRef.current?.send(
      JSON.stringify({ type: 'notification.ack', payload: { notificationId } }),
    );
  }, []);

  return { notifications, acknowledge };
}
