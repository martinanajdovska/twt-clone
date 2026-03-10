export interface IConversationListItem {
  id: number;
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderUsername: string;
  } | null;
  lastMessageAt: string | null;
  hasUnread: boolean;
  unreadCount: number;
}
