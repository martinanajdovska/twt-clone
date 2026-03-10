import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function MessagesHeader({
    otherParticipant,
}: {
    otherParticipant: { username: string; imageUrl: string | null; displayName: string | null } | null;
}) {
    const displayName = otherParticipant?.displayName || otherParticipant?.username || 'Messages'
    return (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
            {otherParticipant ? (
                <Link
                    href={`/users/${otherParticipant.username}`}
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit"
                >
                    <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={otherParticipant.imageUrl ?? undefined} alt={displayName} />
                        <AvatarFallback className="text-sm">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xl font-bold text-foreground truncate">@{otherParticipant.username}</span>
                </Link>
            ) : (
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
            )}
        </div>
    )
}