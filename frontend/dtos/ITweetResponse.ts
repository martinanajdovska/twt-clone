export interface ITweetResponse {
    id: bigint;
    username: string;
    parentId: string;
    content: string;
    imageUrl: string;
    likesCount: number;
    repliesCount: number;
    retweetsCount: number;
    liked: boolean;
    retweeted: boolean;
}