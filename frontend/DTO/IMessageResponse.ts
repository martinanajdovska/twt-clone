export interface IMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  senderUsername: string;
  senderImageUrl: string | null;
  imageUrl: string | null;
  optimisticImageUrl?: string | null;
  gifUrl: string | null;
}
