export interface ITweetResponse {
    id: bigint;
    username: string;
    parentId: string;
    content: string;
    imageUrl: string;
    replies: bigint[];
    likesCount: bigint;
    repliesCount: bigint;
    retweetsCount: bigint;
}