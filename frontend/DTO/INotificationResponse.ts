export interface INotificationResponse {
    id: number;
    actor: string;
    message: string;
    link: string;
    read?: boolean;
    isRead?: boolean;
    createdAt: Date;
    type: string;
}