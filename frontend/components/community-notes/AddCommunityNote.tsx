'use client'

import React, { useState } from "react"
import { StickyNote } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useSubmitNote } from "@/hooks/community-notes/useSubmitNote"

const AddCommunityNote = ({ tweetId }: { tweetId: number }) => {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState("")
    const { mutate: submitNote, isPending } = useSubmitNote(tweetId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        submitNote(content.trim(), {
            onSuccess: () => {
                setContent("")
                setOpen(false)
            },
        })
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => {
                    e.preventDefault()
                    setOpen(true)
                }}
            >
                <StickyNote size={18} />
                Add community note
            </DropdownMenuItem>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add community note</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write a note to add context to this tweet..."
                            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || !content.trim()}>
                                {isPending ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddCommunityNote
