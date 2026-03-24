import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('username') otherUsername: string,
    @CurrentUsername() currentUsername: string,
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('size', ParseIntPipe) size: number = 10,
  ) {
    return this.messagesService.search(q, currentUsername, otherUsername, {
      page,
      size,
    });
  }

  @Get('conversations')
  async getMyConversations(
    @CurrentUsername() username: string,
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('size', ParseIntPipe) size: number = 10,
  ) {
    return this.messagesService.getConversationsForUser(username, {
      page,
      size,
    });
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
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('size', ParseIntPipe) size: number = 10,
  ) {
    return this.messagesService.getMessages(id, username, { page, size });
  }

  @Get('conversations/:id/messages/context')
  async getMessageContext(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
    @Query('createdAt') createdAt: string,
    @Query('size', ParseIntPipe) size: number = 10,
  ) {
    return this.messagesService.getMessageContext(id, username, createdAt, size);
  }

  @Post('conversations/:id/messages')
  @UseInterceptors(FileInterceptor('image'))
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
    @Body('content') content: string,
    @Body('gifUrl') gifUrl?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.messagesService.sendMessage(
      id,
      username,
      content,
      file,
      gifUrl ?? null,
    );
  }

  @Patch('conversations/:id')
  async archiveConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    await this.messagesService.archiveConversation(id, username);
  }
}
