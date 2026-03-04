'use client'

import React, { useState } from "react"
import { ListTodo } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useFetchAllNotesForTweet } from "@/hooks/community-notes/useFetchAllNotesForTweet"
import { useQueryClient } from "@tanstack/react-query"
import NoteCard from "@/components/community-notes/NoteCard"

const AllCommunityNotesDialog = ({ tweetId }: { tweetId: number }) => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data: notes = [], isLoading, error } = useFetchAllNotesForTweet(tweetId, open)

    const handleRated = () => {
        queryClient.invalidateQueries({ queryKey: ["community-notes", "all", tweetId] })
        queryClient.invalidateQueries({ queryKey: ["tweet", tweetId] })
        queryClient.invalidateQueries({ queryKey: ["feed"] })
        queryClient.invalidateQueries({ queryKey: ["profile"] })
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => {
                    e.preventDefault()
                    setOpen(true)
                }}
            >
                <ListTodo size={18} />
                View all community notes
            </DropdownMenuItem>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>All community notes</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col flex-1 min-h-0 px-6 pb-6">
                        {isLoading && (
                            <p className="text-sm text-muted-foreground py-4">
                                Loading notes...
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-destructive py-4">
                                Failed to load notes.
                            </p>
                        )}
                        {!isLoading && !error && notes.length === 0 && (
                            <p className="text-sm text-muted-foreground py-4">
                                No community notes yet. Add one from the tweet menu.
                            </p>
                        )}
                        {!isLoading && !error && notes.length > 0 && (
                            <div className="overflow-y-auto flex flex-col gap-3 pr-1 -mr-1">
                                {[...notes]
                                    .sort(
                                        (a, b) =>
                                            b.helpfulCount - a.helpfulCount ||
                                            a.notHelpfulCount - b.notHelpfulCount
                                    )
                                    .map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onRated={handleRated}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AllCommunityNotesDialog
