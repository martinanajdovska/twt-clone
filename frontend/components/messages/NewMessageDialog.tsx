import { fetchUsers } from "@/api-calls/users-api"
import { useCreateConversation } from "@/hooks/messages/useCreateConversation"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MessageCirclePlus } from "lucide-react"
import { useState, useEffect } from "react"
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation"

export default function NewMessageDialog({ onCreated }: { onCreated: (conversationId: number) => void }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState<string[]>([])
    const [searching, setSearching] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const { mutateAsync: createConversation, isPending } = useCreateConversation()

    async function handleSearch(value: string) {
        setSearch(value)
        if (!value.trim()) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const users = await fetchUsers(value)
            setSearchResults(Array.isArray(users) ? users : [])
        } catch {
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    useEffect(() => {
        if (!open) {
            setHighlightedIndex(0)
            return
        }
        setHighlightedIndex(0)
    }, [open, searchResults.length])

    const handleKeyDown = useKeyboardNavigation({
        items: searchResults,
        highlightedIndex,
        setHighlightedIndex,
        onClose: () => setOpen(false),
        onSelect: (i) => {
            const username = searchResults[i];
            if (username) startConversation(username);
        },
    });

    async function startConversation(username: string) {
        try {
            const res = await createConversation(username)
            setOpen(false)
            setSearch('')
            setSearchResults([])
            onCreated(res.id)
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to start conversation')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2" size="lg">
                    <MessageCirclePlus size={20} />
                    New message
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] sm:max-w-md">
                <DialogTitle>New message</DialogTitle>
                <div className="pt-2">
                    <input
                        type="text"
                        placeholder="Search people"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <ScrollArea className="mt-3 max-h-[280px]">
                        {searching && (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}
                        {!searching && search.trim() && searchResults.length === 0 && (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No users found
                            </div>
                        )}
                        {!searching &&
                            searchResults.map((username, index) => (
                                <button
                                    key={username}
                                    type="button"
                                    onClick={() => startConversation(username)}
                                    className={
                                        `flex w-full items-center gap-3 rounded-lg p-3 text-left ` +
                                        (index === highlightedIndex ? 'bg-accent' : 'hover:bg-accent')
                                    }
                                >
                                    <span className="font-medium">@{username}</span>
                                </button>
                            ))}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}