import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws',
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendToUser(username: string, notification: Notification): void {
    this.server?.to(`user:${username}`).emit('notification', notification);
  }
}
