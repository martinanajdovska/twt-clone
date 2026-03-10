import { User } from 'lucide-react'

export default function MentionDropdown({ users, highlightedIndex, isLoading, mentionQuery, onSelect }: {
    users: string[]
    highlightedIndex: number
    isLoading: boolean
    mentionQuery: string
    onSelect: (username: string) => void
}) {
    return (
        <div className="absolute left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
            {mentionQuery.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Type to search users</div>
            ) : isLoading ? (
                <div className="px-4 py-4 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : users.length > 0 ? (
                <div className="flex flex-col py-1">
                    {users.map((u, i) => (
                        <button
                            key={u}
                            type="button"
                            onClick={() => onSelect(u)}
                            className={`px-4 py-3 flex items-center gap-3 transition-colors text-left ${i === highlightedIndex ? '!bg-primary/15 ring-inset ring-2 ring-primary/40' : 'hover:bg-muted'}`}
                        >
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User size={18} className="text-muted-foreground" />
                            </div>
                            <span className="font-bold text-sm text-foreground">@{u}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">No users found for &quot;{mentionQuery}&quot;</div>
            )}
        </div>
    )
}