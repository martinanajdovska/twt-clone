import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
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
  }

  async findAllByRecipient(username: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { recipient: username },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    await this.notificationRepo.save(notification);
  }
}
