export interface ITweetResponse {
    id: number;
    username: string;
    profilePictureUrl: string | null;
    parentId: number | null;
    content: string;
    imageUrl: string | null;
    isPinned: boolean;
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
    isLiked: boolean;
    isRetweeted: boolean;
    isBookmarked: boolean;
    retweetedBy: string | null;
    createdAt: string;
    communityNote: { id: number; content: string; helpfulCount: number; userRating: boolean | null } | null;
}