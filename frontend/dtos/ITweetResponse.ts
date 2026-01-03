export interface ITweetResponse {
    id: number;
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