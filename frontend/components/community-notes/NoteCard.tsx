'use client'

import React, { useEffect, useState } from "react"
import { useRateNote } from "@/hooks/community-notes/useRateNote"
import type { AllNoteItem } from "@/hooks/community-notes/useFetchAllNotesForTweet"

type NoteCardProps = {
    note: AllNoteItem
    onRated: () => void
}

const NoteCard = ({ note, onRated }: NoteCardProps) => {
    const { mutate: rateNote, isPending } = useRateNote()
    const [selectedRating, setSelectedRating] = useState<boolean | null>(note.userRating ?? null)

    useEffect(() => {
        setSelectedRating(note.userRating ?? null)
    }, [note.id, note.userRating])

    const handleRate = (helpful: boolean) => {
        setSelectedRating(helpful)
        rateNote(
            { noteId: note.id, helpful },
            { onSuccess: onRated }
        )
    }

    return (
        <div
            className={`rounded-lg border p-3 text-sm ${
                note.isVisible
                    ? "border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-500/50"
                    : "border-border bg-muted/30"
            }`}
        >
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-muted-foreground text-xs">
                    @{note.authorUsername}
                </span>
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        note.isVisible
                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                            : "bg-muted text-muted-foreground"
                    }`}
                >
                    {note.isVisible ? "Visible" : "Pending"}
                </span>
            </div>
            <p className="whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-3 mt-2">
                <button
                    type="button"
                    onClick={() => handleRate(true)}
                    disabled={isPending}
                    className="text-xs hover:underline disabled:opacity-50 text-muted-foreground"
                    style={selectedRating === true ? { color: '#2563eb', fontWeight: 600 } : undefined}
                >
                    Helpful
                </button>
                <button
                    type="button"
                    onClick={() => handleRate(false)}
                    disabled={isPending}
                    className="text-xs hover:underline disabled:opacity-50 text-muted-foreground"
                    style={selectedRating === false ? { color: '#2563eb', fontWeight: 600 } : undefined}
                >
                    Not helpful
                </button>
                <span className="text-xs text-muted-foreground">
                    {note.helpfulCount} helpful · {note.notHelpfulCount} not helpful
                </span>
            </div>
        </div>
    )
}

export default NoteCard
