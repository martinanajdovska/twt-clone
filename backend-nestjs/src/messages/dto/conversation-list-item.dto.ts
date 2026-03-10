export interface ConversationListItemDto {
  id: number;
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderUsername: string;
  } | null;
  lastMessageAt: Date | null;
  hasUnread: boolean;
  unreadCount: number;
}
