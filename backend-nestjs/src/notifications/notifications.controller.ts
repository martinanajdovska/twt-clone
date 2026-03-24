import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @CurrentUsername() username: string,
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('size', ParseIntPipe) size: number = 10,
  ) {
    return this.notificationsService.findAllByRecipient(username, {
      page,
      size,
    });
  }

  @Patch(':id')
  async readNotification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    await this.notificationsService.markAsRead(id, username);
  }
}
