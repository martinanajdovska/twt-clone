import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { Notification } from '../entities/notification.entity';

function getTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  return match ? match[1].trim() : null;
}

function getTokenFromAuthorizationHeader(
  authorizationHeader: unknown,
): string | null {
  if (typeof authorizationHeader !== 'string') return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  path: '/ws',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(socket: Socket) {
    const token =
      // browser session cookie (web)
      getTokenFromCookie(socket.handshake.headers.cookie) ??
      // native client Authorization header (mobile)
      getTokenFromAuthorizationHeader(socket.handshake.headers.authorization) ??
      // fallback: socket auth payload
      (typeof (socket.handshake.auth as any)?.token === 'string'
        ? (socket.handshake.auth as any).token
        : null);
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const username = payload.sub;
      socket.join(`user:${username}`);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(_socket: Socket) {}

  sendToUser(username: string, notification: Notification): void {
    this.server?.to(`user:${username}`).emit('notification', notification);
  }

  emitNewMessage(
    usernames: string[],
    payload: { conversationId: number; message: unknown },
  ): void {
    usernames.forEach((username) => {
      this.server?.to(`user:${username}`).emit('new_message', payload);
    });
  }
}
