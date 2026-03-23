export interface ICommunityNoteDisplay {
  id: number;
  content: string;
  helpfulCount: number;
  isHelpful: boolean | null;
}

export interface IAllNoteItem {
  id: number;
  content: string;
  isVisible: boolean;
  authorUsername: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isHelpful: boolean | null;
}
