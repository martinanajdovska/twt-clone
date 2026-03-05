export interface ITweetResponse {
    id: number;
    username: string;
    profilePictureUrl: string;
    parentId: number;
    content: string;
    imageUrl: string;
    likesCount: number;
    repliesCount: number;
    retweetsCount: number;
    liked: boolean;
    retweeted: boolean;
    retweetedBy: string;
    createdAt: string;
    communityNote: { id: number; content: string; helpfulCount: number; userRating: boolean | null } | null;
}