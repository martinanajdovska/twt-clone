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

export interface IMessageItem {
  id: number;
  content: string;
  createdAt: string;
  senderUsername: string;
  senderImageUrl: string | null;
  imageUrl: string | null;
  gifUrl: string | null;
}

export interface IMessagePage {
  content: IMessageItem[];
  totalElements: number;
  size: number;
  number: number;
}
