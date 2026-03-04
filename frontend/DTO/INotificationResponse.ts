export interface INotificationResponse {
    id: number;
    actor: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: Date;
    type: string;
}