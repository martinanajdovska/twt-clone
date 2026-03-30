import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function MessagesHeader({
    otherParticipant,
    showSearch = false,
    searchQuery = '',
    onSearchQueryChange,
    isSearching = false,
    searchResults = [],
    onSelectSearchResult,
}: {
    otherParticipant: { username: string; imageUrl: string | null; displayName: string | null } | null;
    showSearch?: boolean;
    searchQuery?: string;
    onSearchQueryChange?: (value: string) => void;
    isSearching?: boolean;
    searchResults?: { id: number; content: string; createdAt: string }[];
    onSelectSearchResult?: (result: { id: number; content: string; createdAt: string }) => void;
}) {
    const displayName = otherParticipant?.displayName || otherParticipant?.username || 'Messages'
    return (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
            {otherParticipant ? (
                <div className="flex items-start justify-between gap-3">
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
                    {showSearch && (
                        <div className="relative w-[220px] max-w-[55vw]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                                placeholder="Search"
                                className="w-full rounded-full border border-input bg-background px-3 py-1.5 text-sm"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute right-0 mt-2 w-[320px] max-w-[75vw] max-h-40 overflow-y-auto rounded-md border border-border bg-background shadow-md">
                                    {searchResults.map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => onSelectSearchResult?.(r)}
                                            className="block w-full border-b border-border px-3 py-2 text-left text-xs hover:bg-accent"
                                        >
                                            <div className="truncate">{r.content || '(media)'}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {isSearching && (
                                <div className="absolute right-3 top-1.5 text-[11px] text-muted-foreground">
                                    ...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
            )}
        </div>
    )
}