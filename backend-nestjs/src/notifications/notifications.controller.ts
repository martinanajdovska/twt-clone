import { Controller, Get, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@CurrentUsername() username: string) {
    return this.notificationsService.findAllByRecipient(username);
  }

  @Patch(':id')
  async readNotification(
    @Param('id') id: string,
    @CurrentUsername() _username: string,
  ) {
    await this.notificationsService.markAsRead(parseInt(id, 10));
  }
}
