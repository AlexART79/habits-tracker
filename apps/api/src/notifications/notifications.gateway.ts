import { Inject, Logger } from '@nestjs/common';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { promisify } from 'util';
import type { IncomingMessage } from 'http';
import type { RequestHandler } from 'express';
import type WebSocket from 'ws';
import { SESSION_MIDDLEWARE } from '../config/session.config';
import { MilestoneService } from './milestone.service';

interface SessionRequest extends IncomingMessage {
  session?: { passport?: { user?: string } };
}

interface WsMessage {
  type: string;
  payload?: Record<string, unknown>;
}

@WebSocketGateway({ path: '/ws' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly clients = new Map<WebSocket, string>();

  constructor(
    @Inject(SESSION_MIDDLEWARE) private readonly sessionMiddleware: RequestHandler,
    private readonly milestoneService: MilestoneService,
  ) {}

  async handleConnection(client: WebSocket, request: IncomingMessage): Promise<void> {
    try {
      await promisify(this.sessionMiddleware)(
        request as Parameters<RequestHandler>[0],
        {} as Parameters<RequestHandler>[1],
      );
    } catch {
      client.close(1011, 'Session error');
      return;
    }

    const userId = (request as SessionRequest).session?.passport?.user;
    if (!userId) {
      client.close(1008, 'Unauthorized');
      return;
    }

    this.clients.set(client, userId);
    this.logger.log(`Client connected: ${userId}`);

    client.on('message', (raw) => {
      void this.handleMessage(client, raw.toString());
    });
  }

  handleDisconnect(client: WebSocket): void {
    const userId = this.clients.get(client);
    this.clients.delete(client);
    if (userId) this.logger.log(`Client disconnected: ${userId}`);
  }

  private async handleMessage(client: WebSocket, raw: string): Promise<void> {
    let msg: WsMessage;
    try {
      msg = JSON.parse(raw) as WsMessage;
    } catch {
      return;
    }

    const userId = this.clients.get(client);
    if (!userId) return;

    if (msg.type === 'milestones.subscribe') {
      const milestones = await this.milestoneService.evaluateMilestones(userId);
      for (const payload of milestones) {
        client.send(JSON.stringify({ type: 'milestone.reached', payload }));
      }
    } else if (msg.type === 'notification.ack') {
      const notificationId = msg.payload?.['notificationId'];
      if (typeof notificationId === 'string') {
        await this.milestoneService.acknowledge(notificationId);
      }
    }
  }
}
