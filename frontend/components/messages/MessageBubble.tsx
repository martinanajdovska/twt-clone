import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import { formatRelativeTime } from "@/lib/relativeTime";

export default function MessageBubble({ msg, isSelf }: { msg: IMessageResponse; isSelf: boolean }) {
    const displayName = isSelf ? 'You' : `@${msg.senderUsername}`
    return (
        <div className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : ''} mb-4`}>
            <Link
                href={`/users/${msg.senderUsername}`}
                className="shrink-0 hover:opacity-90 transition-opacity"
            >
                <Avatar className="h-9 w-9">
                    <AvatarImage src={msg.senderImageUrl ?? undefined} alt={msg.senderUsername} />
                    <AvatarFallback className="text-xs">{msg.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-muted-foreground mb-0.5">{displayName}</span>
                <div
                    className={`rounded-2xl px-4 py-2 text-sm ${isSelf
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                        }`}
                >
                    {msg.content}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(msg.createdAt)}
                </span>
            </div>
        </div>
    )
}