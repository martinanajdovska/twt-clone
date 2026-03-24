export interface INotificationItem {
  id: number;
  actor: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

export interface INotificationPage {
  content: INotificationItem[];
  totalElements: number;
  size: number;
  number: number;
  unreadCount: number;
}
