import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation-participant.entity';
import { Message } from '../entities/message.entity';
import { UsersService } from '../users/users.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import type { ConversationListItemDto } from './dto/conversation-list-item.dto';
import type { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findOrCreateConversation(
    currentUsername: string,
    otherUsername: string,
  ): Promise<{
    id: number;
    otherParticipant: {
      username: string;
      imageUrl: string | null;
      displayName: string | null;
    };
  }> {
    if (currentUsername === otherUsername) {
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );
    }

    const currentUser = await this.usersService.findByUsername(currentUsername);
    if (!currentUser) throw new NotFoundException('User not found');

    const otherUser = await this.usersService.findByUsername(otherUsername);
    if (!otherUser) throw new NotFoundException('User not found');

    const existing = await this.findConversationBetween(
      currentUser.id,
      otherUser.id,
    );
    if (existing) {
      let participant = await this.participantRepo.findOne({
        where: {
          conversation: { id: existing.id },
          user: { id: currentUser.id },
        },
      });

      if (participant!.archivedAt !== null) {
        participant!.archivedAt = null;
        await this.participantRepo.save(participant!);
      }

      return {
        id: existing.id,
        otherParticipant: {
          username: otherUser.username,
          imageUrl: otherUser.imageUrl ?? null,
          displayName: otherUser.displayName ?? null,
        },
      };
    }

    const conversation = this.conversationRepo.create({});
    const saved = await this.conversationRepo.save(conversation);

    await this.participantRepo.save([
      this.participantRepo.create({ conversation: saved, user: currentUser }),
      this.participantRepo.create({ conversation: saved, user: otherUser }),
    ]);

    return {
      id: saved.id,
      otherParticipant: {
        username: otherUser.username,
        imageUrl: otherUser.imageUrl ?? null,
        displayName: otherUser.displayName ?? null,
      },
    };
  }

  private async findConversationBetween(
    userId1: number,
    userId2: number,
  ): Promise<Conversation | null> {
    const participants = await this.participantRepo.find({
      where: { user: { id: In([userId1, userId2]) } },
      relations: ['conversation'],
    });
    const byConv = new Map<number, number>();

    for (const p of participants) {
      const convId = p.conversation.id;
      byConv.set(convId, (byConv.get(convId) ?? 0) + 1);
    }

    const convIdWithTwoParticipants = [...byConv.entries()].find(
      ([, count]) => count === 2,
    )?.[0];
    if (convIdWithTwoParticipants == null) return null;

    return this.conversationRepo.findOne({
      where: { id: convIdWithTwoParticipants },
    });
  }

  async getConversationsForUser(
    username: string,
  ): Promise<ConversationListItemDto[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return [];

    const participants = await this.participantRepo.find({
      where: { user: { id: user.id }, archivedAt: IsNull() },
      relations: ['conversation'],
    });
    const conversationIds = participants.map((p) => p.conversation.id);
    if (conversationIds.length === 0) return [];

    const convs = await this.conversationRepo.find({
      where: { id: In(conversationIds) },
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });

    const result: ConversationListItemDto[] = [];
    for (const conv of convs) {
      const allParticipants = await this.participantRepo.find({
        where: { conversation: { id: conv.id } },
        relations: ['user'],
      });

      const currentParticipant = allParticipants.find(
        (p) => p.user.id === user.id,
      );

      const other = allParticipants.find((p) => p.user.id !== user.id);

      if (!other) throw new NotFoundException('Other participant not found');

      const otherUser = other.user as {
        username: string;
        imageUrl: string | null;
        displayName: string | null;
      };

      const lastMsg = await this.messageRepo.findOne({
        where: { conversation: { id: conv.id } },
        order: { createdAt: 'DESC' },
        relations: ['sender'],
      });

      const lastReadAt = currentParticipant!.lastReadAt ?? null;
      let unreadCountVal = 0;

      if (lastReadAt) {
        unreadCountVal = await this.messageRepo
          .createQueryBuilder('m')
          .innerJoin('m.sender', 's')
          .where('m.conversation_id = :convId', { convId: conv.id })
          .andWhere('m.created_at > :lastRead', { lastRead: lastReadAt })
          .andWhere('s.username != :username', { username })
          .getCount();
      } else {
        unreadCountVal = await this.messageRepo
          .createQueryBuilder('m')
          .innerJoin('m.sender', 's')
          .where('m.conversation_id = :convId', { convId: conv.id })
          .andWhere('s.username != :username', { username })
          .getCount();
      }

      result.push({
        id: conv.id,
        otherParticipant: {
          username: otherUser.username,
          imageUrl: otherUser.imageUrl ?? null,
          displayName: otherUser.displayName ?? null,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              senderUsername: (lastMsg.sender as { username: string }).username,
            }
          : null,
        lastMessageAt: conv.lastMessageAt ?? null,
        hasUnread: unreadCountVal > 0,
        unreadCount: unreadCountVal,
      });
    }
    return result;
  }

  async getUnreadCount(username: string): Promise<number> {
    const conversations = await this.getConversationsForUser(username);
    return conversations.filter((c) => c.hasUnread).length;
  }

  async markConversationAsRead(
    conversationId: number,
    username: string,
  ): Promise<void> {
    const { currentUser } = await this.ensureParticipant(
      conversationId,
      username,
    );
    const participant = await this.participantRepo.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: currentUser.id },
      },
    });
    if (!participant) return;
    participant.lastReadAt = new Date();
    await this.participantRepo.save(participant);
  }

  async getConversationById(
    conversationId: number,
    username: string,
  ): Promise<{
    id: number;
    otherParticipant: {
      username: string;
      imageUrl: string | null;
      displayName: string | null;
    };
  }> {
    const { conversation, currentUser } = await this.ensureParticipant(
      conversationId,
      username,
    );
    const participants = await this.participantRepo.find({
      where: { conversation: { id: conversationId } },
      relations: ['user'],
    });
    const other = participants.find((p) => p.user.id !== currentUser.id);

    if (!other) throw new NotFoundException('Conversation not found');

    const u = other.user as {
      username: string;
      imageUrl: string | null;
      displayName: string | null;
    };

    return {
      id: conversationId,
      otherParticipant: {
        username: u.username,
        imageUrl: u.imageUrl ?? null,
        displayName: u.displayName ?? null,
      },
    };
  }

  async getMessages(
    conversationId: number,
    username: string,
  ): Promise<MessageResponseDto[]> {
    await this.ensureParticipant(conversationId, username);

    const messages = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderUsername: (m.sender as { username: string }).username,
      senderImageUrl:
        (m.sender as { imageUrl: string | null }).imageUrl ?? null,
    }));
  }

  async sendMessage(
    conversationId: number,
    username: string,
    content: string,
  ): Promise<MessageResponseDto> {
    const { conversation, currentUser } = await this.ensureParticipant(
      conversationId,
      username,
    );

    if (content.length === 0 || content == null)
      throw new BadRequestException('Message cannot be empty');
    if (content.length > 10000)
      throw new BadRequestException(
        'Message cannot be longer than 10000 characters',
      );

    const message = this.messageRepo.create({
      conversation,
      sender: currentUser,
      content,
    });
    const saved = await this.messageRepo.save(message);

    conversation.lastMessageAt = saved.createdAt;
    await this.conversationRepo.save(conversation);

    const messageResponse: MessageResponseDto = {
      id: saved.id,
      content: saved.content,
      createdAt: saved.createdAt,
      senderUsername: username,
      senderImageUrl: currentUser.imageUrl ?? null,
    };

    const participants = await this.participantRepo.find({
      where: { conversation: { id: conversationId } },
      relations: ['user'],
    });

    const recipientUsernames = participants
      .map((p) => p.user.username)
      .filter((u) => u !== username);

    this.notificationsGateway.emitNewMessage(recipientUsernames, {
      conversationId,
      message: messageResponse,
    });

    return messageResponse;
  }

  private async ensureParticipant(
    conversationId: number,
    username: string,
  ): Promise<{
    conversation: Conversation;
    currentUser: { id: number; username: string; imageUrl: string | null };
  }> {
    const currentUser = await this.usersService.findByUsername(username);
    if (!currentUser) throw new NotFoundException('User not found');

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const participant = await this.participantRepo.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: currentUser.id },
      },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    return {
      conversation,
      currentUser: {
        id: currentUser.id,
        username: currentUser.username,
        imageUrl: currentUser.imageUrl ?? null,
      },
    };
  }

  async archiveConversation(
    conversationId: number,
    username: string,
  ): Promise<void> {
    const { currentUser } = await this.ensureParticipant(
      conversationId,
      username,
    );

    const participant = await this.participantRepo.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: currentUser.id },
      },
    });

    participant!.archivedAt = new Date();
    await this.participantRepo.save(participant!);
  }
}
