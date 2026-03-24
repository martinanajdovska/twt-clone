export interface TweetResponseDto {
  id: number;
  username: string;
  displayName: string | null;
  content: string;
  imageUrl: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  isPinned: boolean;
  quotedTweet: {
    id: number;
    username: string;
    content: string;
    imageUrl: string | null;
    gifUrl: string | null;
    videoUrl: string | null;
    createdAt: string;
    isDeleted: boolean;
  } | null;
  poll: {
    id: number;
    endsAt: string;
    options: { id: number; label: string; votes: number }[];
    selectedOptionId: number | null;
  } | null;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  quotesCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked: boolean;
  parentId: number | null;
  retweetedBy: string | null;
  createdAt: string;
  profilePictureUrl: string | null;
  communityNote: {
    id: number;
    content: string;
    helpfulCount: number;
    isHelpful: boolean | null;
  } | null;
}
