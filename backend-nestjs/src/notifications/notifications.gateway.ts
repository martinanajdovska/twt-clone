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

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowed = [process.env.FRONTEND_URL, /\.vercel\.app$/];
      const isAllowed =
        !origin ||
        allowed.some((o) =>
          typeof o === 'string' ? o === origin : o!.test(origin),
        );
      if (isAllowed) {
        callback(null, origin || true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  path: '/ws',
  transports: ['polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(socket: Socket) {
    const token = getTokenFromCookie(socket.handshake.headers.cookie);
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
