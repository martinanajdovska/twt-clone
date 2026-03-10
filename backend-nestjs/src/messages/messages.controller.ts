import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getMyConversations(@CurrentUsername() username: string) {
    return this.messagesService.getConversationsForUser(username);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUsername() username: string) {
    return { count: await this.messagesService.getUnreadCount(username) };
  }

  @Post('conversations')
  async createOrGetConversation(
    @CurrentUsername() username: string,
    @Body('otherUsername') otherUsername: string,
  ) {
    return this.messagesService.findOrCreateConversation(
      username,
      otherUsername,
    );
  }

  @Patch('conversations/:id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    await this.messagesService.markConversationAsRead(id, username);
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    return this.messagesService.getConversationById(id, username);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    return this.messagesService.getMessages(id, username);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
    @Body('content') content: string,
  ) {
    return this.messagesService.sendMessage(id, username, content);
  }

  @Patch('conversations/:id')
  async archiveConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    await this.messagesService.archiveConversation(id, username);
  }
}
