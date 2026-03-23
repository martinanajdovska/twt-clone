import Link from "next/link";
import { IConversationListItem } from "@/DTO/IConversationListItem";
import { formatRelativeTime } from "@/lib/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Archive } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useArchiveConversation as useArchiveConversation } from "@/hooks/messages/useArchiveConversations";


export default function ConversationListItem({ conv, currentId }: { conv: IConversationListItem; currentId: number | null }) {
    const isActive = currentId === conv.id
    const hasUnread = conv.hasUnread
    const displayName = conv.otherParticipant.displayName || conv.otherParticipant.username
    const preview = conv.lastMessage
        ? (conv.lastMessage.senderUsername === conv.otherParticipant.username ? '' : 'You: ') + conv.lastMessage.content
        : 'No messages yet'
    const time = conv.lastMessageAt
        ? formatRelativeTime(conv.lastMessageAt)
        : ''

    const { mutate: archiveConversation } = useArchiveConversation();

    return (
        <div className={`relative group flex gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-accent' : hasUnread ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-accent/50'}`}>
            <Link href={`/messages?conversation=${conv.id}`} className="flex gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={conv.otherParticipant.imageUrl ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-sm">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">{displayName}</span>
                        {time && <span className="text-xs text-muted-foreground shrink-0">{time}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{preview}</p>
                </div>
            </Link>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-full"
                    >
                        <Archive size={15} />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the conversation from your inbox. The other person will still be able to see it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => archiveConversation(conv.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}