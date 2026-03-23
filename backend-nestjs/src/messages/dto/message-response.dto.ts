export interface MessageResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  senderUsername: string;
  senderImageUrl: string | null;
  imageUrl: string | null;
  gifUrl: string | null;
}
