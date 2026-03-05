export interface TweetResponseDto {
  id: number;
  username: string;
  content: string;
  imageUrl: string | null;
  quotedTweet: {
    id: number;
    username: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    isDeleted: boolean;
  } | null;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  quotesCount: number;
  bookmarksCount: number;
  liked: boolean;
  retweeted: boolean;
  bookmarked: boolean;
  parentId: number | null;
  retweetedBy: string | null;
  createdAt: string;
  profilePictureUrl: string | null;
  communityNote: { id: number; content: string; helpfulCount: number; userRating: boolean | null } | null;
}
