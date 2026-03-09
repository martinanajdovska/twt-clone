'use client'

import React, { useEffect, useState } from "react"
import { useRateNote } from "@/hooks/community-notes/useRateNote"

type Note = { id: number; content: string; isHelpful?: boolean | null }

const CommunityNoteDisplay = ({ note }: { note: Note | null }) => {
    const { mutate: rateNote } = useRateNote()
    const [selectedRating, setSelectedRating] = useState<boolean | null>(null)

    useEffect(() => {
        setSelectedRating(note?.isHelpful ?? null)
    }, [note?.id, note?.isHelpful])

    if (!note) return null

    const isHelpful = selectedRating === true
    const isNotHelpful = selectedRating === false

    const handleRate = (helpful: boolean) => (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedRating(helpful)
        rateNote({ noteId: note.id, helpful })
    }

    return (
        <div className="mt-3 pt-3 border-t border-border">
            <div className="rounded-2xl border-2 border-primary bg-primary/5 dark:bg-primary/10 p-4">
                <span className="font-bold text-[15px] text-foreground">Community Note</span>
                <p className="mt-1.5 text-[15px] text-foreground leading-snug">{note.content}</p>
                <div className="flex gap-4 mt-3 text-muted-foreground text-[14px]">
                    <button
                        onClick={handleRate(true)}
                        className={`hover:underline ${isHelpful ? 'text-primary font-semibold' : ''}`}
                    >
                        Helpful
                    </button>
                    <button
                        onClick={handleRate(false)}
                        className={`hover:underline ${isNotHelpful ? 'text-primary font-semibold' : ''}`}
                    >
                        Not helpful
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CommunityNoteDisplay
