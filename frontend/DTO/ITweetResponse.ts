export interface ITweetResponse {
    id: number;
    username: string;
    profilePictureUrl: string;
    parentId: number;
    content: string;
    imageUrl: string;
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
    retweetedBy: string | null;
    createdAt: string;
    communityNote: { id: number; content: string; helpfulCount: number; userRating: boolean | null } | null;
}