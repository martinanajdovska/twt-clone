export interface ICreateConversationResponse {
  id: number;
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
}
