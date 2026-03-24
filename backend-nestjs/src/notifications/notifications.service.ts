import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from 'src/users/users.service';
import { PushService } from 'src/push/push.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly pushService: PushService,
  ) {}

  async createNotification(
    recipient: string,
    actor: string,
    message: string,
    link: string,
    type: NotificationType,
  ): Promise<void> {
    const notification = this.notificationRepo.create({
      recipient,
      actor,
      message,
      link,
      type,
    });
    const saved = await this.notificationRepo.save(notification);
    this.notificationsGateway.sendToUser(recipient, saved);

    try {
      await this.pushService.sendNotificationToUser(recipient, {
        title: message,
        body: `@${actor}`,
        data: { link },
        sound: 'default',
        channelId: 'default',
      });
    } catch (err) {
      console.warn('Push notification failed for', recipient, err);
    }
  }

  async sendMessagePush(
    recipientUsername: string,
    conversationId: number,
    senderUsername: string,
    contentPreview: string,
  ): Promise<void> {
    const link = `/messages/${conversationId}`;
    const title = `@${senderUsername}`;
    const body =
      contentPreview.length > 80
        ? contentPreview.slice(0, 77) + '...'
        : contentPreview || 'New message';

    try {
      await this.pushService.sendNotificationToUser(recipientUsername, {
        title,
        body,
        data: { link },
        sound: 'default',
        channelId: 'default',
      });
    } catch (err) {
      console.warn('Message push failed for', recipientUsername, err);
    }
  }

  async findAllByRecipient(
    username: string,
    pageable: { page: number; size: number },
  ): Promise<{
    content: Notification[];
    totalElements: number;
    size: number;
    number: number;
    unreadCount: number;
  }> {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { recipient: username },
      order: { createdAt: 'DESC' },
      skip: pageable.page * pageable.size,
      take: pageable.size,
    });
    const unreadCount = await this.notificationRepo.count({
      where: { recipient: username, isRead: false },
      order: { createdAt: 'DESC' },
    });
    return {
      content: notifications,
      totalElements: total,
      size: pageable.size,
      number: pageable.page,
      unreadCount,
    };
  }

  async markAsRead(id: number, username: string): Promise<void> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const notification = await this.notificationRepo.findOne({
      where: { id },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    await this.notificationRepo.save(notification);
  }
}
