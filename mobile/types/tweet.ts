export interface ITweet {
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

export interface IVideoTweetsResponse {
  content: ITweet[];
  totalElements: number;
  size: number;
  page: number;
}

export interface ITweetDetailsResponse {
  tweet: ITweet;
  parentTweet?: ITweet | null;
  parentChain?: ITweet[];
  replies: ITweet[];
}
