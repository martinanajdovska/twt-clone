import React from 'react'
import {formatDistanceToNow} from "date-fns";
import {INotificationResponse} from "@/dtos/INotificationResponse";
import {Bell, Heart, MessageSquare, Repeat, UserIcon} from "lucide-react";
import {useReadNotification} from "@/hooks/notifications/useReadNotification";
import {useRouter} from "next/navigation";

const Notification = ({notification}:{notification: INotificationResponse}) => {
    const { mutate: readNotification } = useReadNotification();
    const router = useRouter();

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE':
                return <Heart className="fill-red-500 text-red-500" size={16}/>;
            case 'REPLY':
                return <MessageSquare className="text-blue-500" size={16}/>;
            case 'RETWEET':
                return <Repeat className="text-green-500" size={16}/>;
            case 'FOLLOW':
                return <UserIcon className="text-gray-600" size={16}/>;
            default:
                return <Bell size={16}/>;
        }
    };

    function openNotification({link, id, isRead}:{link: string, id: number, isRead: boolean}) {
        router.push(link);
        if (!isRead) {
            readNotification({id});
        }
    }

    return (
        <div
            onClick={() => {openNotification({link:notification.link, id:notification.id, isRead:notification.read});
            }}
            key={notification.id}
            className={`flex gap-3 p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
        >
            <div className="mt-1">{getIcon(notification.type)}</div>
            <div className="flex flex-col gap-1">
                <p className="text-sm">
                    <span className="font-bold">@{notification.actor}</span> {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                </span>
            </div>
        </div>
    )
}
export default Notification
