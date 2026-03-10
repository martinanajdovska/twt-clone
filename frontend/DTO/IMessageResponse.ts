export interface IMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  senderUsername: string;
  senderImageUrl: string | null;
}
