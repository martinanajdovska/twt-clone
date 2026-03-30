export interface ITweetResponse {
  id: number;
  username: string;
  profilePictureUrl: string | null;
  displayName: string | null;
  parentId: number | null;
  content: string;
  imageUrl: string | null;
  optimisticImageUrl?: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  optimisticVideoUrl?: string | null;
  isPinned: boolean;
  quotedTweet: {
    id: number;
    username: string;
    content: string;
    imageUrl: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
    createdAt: string;
    isDeleted: boolean;
  } | null;
  poll: {
    id: number;
    endsAt: string;
    options: { id: number; label: string; votes: number }[];
    selectedOptionId: number | null;
    isClosed: boolean;
  } | null;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  quotesCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked: boolean;
  retweetedBy: string | null;
  createdAt: string;
  communityNote: {
    id: number;
    content: string;
    helpfulCount: number;
    isHelpful: boolean | null;
  } | null;
}
