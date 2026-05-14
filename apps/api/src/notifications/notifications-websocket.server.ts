import { Inject, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { RequestHandler } from 'express';
import type { Session, SessionData } from 'express-session';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import type { ClientWebSocketMessage } from '@habit-tracker/shared';
import { WEBSOCKET_EVENTS } from '@habit-tracker/shared';
import { getSessionMiddleware } from '../app.setup';
import { NotificationsService } from './notifications.service';

type SessionRequest = IncomingMessage & {
  session?: Session & Partial<SessionData> & { user?: { id: string } };
};

@Injectable()
export class NotificationsWebSocketServer {
  private readonly webSocketServer = new WebSocketServer({ noServer: true });
  private readonly sessionMiddleware: RequestHandler = getSessionMiddleware();
  private isAttached = false;

  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {
    this.webSocketServer.on('connection', (socket, request: SessionRequest) => {
      const userId = request.session?.user?.id;

      if (!userId) {
        socket.close();
        return;
      }

      void this.handleConnection(socket, userId);
    });
  }

  attach(server: Server): void {
    if (this.isAttached) {
      return;
    }

    server.on('upgrade', (request, socket, head) => {
      if (new URL(request.url ?? '/', 'http://localhost').pathname !== '/ws') {
        return;
      }

      this.authenticateUpgrade(request, (isAuthenticated) => {
        if (!isAuthenticated) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
          this.webSocketServer.emit('connection', webSocket, request);
        });
      });
    });
    this.isAttached = true;
  }

  private authenticateUpgrade(
    request: IncomingMessage,
    callback: (isAuthenticated: boolean) => void,
  ): void {
    const response = this.createUpgradeResponse();

    this.sessionMiddleware(
      request as unknown as Request,
      response as unknown as Response,
      () => {
        const sessionRequest = request as SessionRequest;
        callback(Boolean(sessionRequest.session?.user?.id));
      },
    );
  }

  private createUpgradeResponse(): Partial<ServerResponse> {
    const response: Partial<ServerResponse> = {
      getHeader: () => undefined,
      setHeader: () => response as ServerResponse,
      writeHead: () => response as ServerResponse,
    };

    return response;
  }

  private handleConnection(socket: WebSocket, userId: string): void {
    const pendingMessages = this.notificationsService.evaluateMilestones(userId);

    socket.on('message', (message) => {
      const parsedMessage = this.parseMessage(message.toString());

      if (!parsedMessage) {
        return;
      }

      if (parsedMessage.type === WEBSOCKET_EVENTS.milestonesSubscribe) {
        void pendingMessages.then((messages) => {
          for (const pendingMessage of messages) {
            socket.send(JSON.stringify(pendingMessage));
          }
        });
        return;
      }

      if (parsedMessage.type === WEBSOCKET_EVENTS.notificationAck) {
        void this.notificationsService.acknowledge(
          userId,
          parsedMessage.payload.notificationId,
        );
      }
    });
  }

  private parseMessage(message: string): ClientWebSocketMessage | null {
    try {
      const parsed = JSON.parse(message) as unknown;

      if (!this.isClientMessage(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private isClientMessage(message: unknown): message is ClientWebSocketMessage {
    if (!message || typeof message !== 'object' || !('type' in message)) {
      return false;
    }

    const typedMessage = message as { type: unknown; payload?: unknown };

    if (typedMessage.type === WEBSOCKET_EVENTS.milestonesSubscribe) {
      return this.hasObjectPayload(typedMessage.payload);
    }

    if (typedMessage.type === WEBSOCKET_EVENTS.notificationAck) {
      return (
        this.hasObjectPayload(typedMessage.payload) &&
        typeof typedMessage.payload.notificationId === 'string'
      );
    }

    return false;
  }

  private hasObjectPayload(payload: unknown): payload is Record<string, unknown> {
    return Boolean(payload) && typeof payload === 'object';
  }
}
