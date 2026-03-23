export interface INotificationItem {
  id: number;
  actor: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}
