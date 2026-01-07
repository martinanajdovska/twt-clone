export interface INotificationResponse {
    id: number;
    actor: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: Date;
    type: string;
}