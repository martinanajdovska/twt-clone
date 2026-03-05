'use client'

import React, { useEffect, useState } from "react"
import { useRateNote } from "@/hooks/community-notes/useRateNote"

type Note = { id: number; content: string; userRating?: boolean | null }

const CommunityNoteDisplay = ({ note }: { note: Note | null }) => {
    const { mutate: rateNote } = useRateNote()
    const [selectedRating, setSelectedRating] = useState<boolean | null>(null)

    useEffect(() => {
        setSelectedRating(note?.userRating ?? null)
    }, [note?.id, note?.userRating])

    if (!note) return null

    const isHelpful = selectedRating === true
    const isNotHelpful = selectedRating === false

    const handleRate = (helpful: boolean) => (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedRating(helpful)
        rateNote({ noteId: note.id, helpful })
    }

    return (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-500 p-3 mt-2 text-sm rounded-r">
            <span className="font-bold">Community Note</span>
            <p className="mt-1">{note.content}</p>
            <div className="flex gap-4 mt-2 text-gray-500 dark:text-gray-400">
                <button
                    onClick={handleRate(true)}
                    style={isHelpful ? { color: 'var(--color-blue-600, #2563eb)', fontWeight: 600 } : undefined}
                    className="hover:underline"
                >
                    Helpful
                </button>
                <button
                    onClick={handleRate(false)}
                    style={isNotHelpful ? { color: 'var(--color-blue-600, #2563eb)', fontWeight: 600 } : undefined}
                    className="hover:underline"
                >
                    Not helpful
                </button>
            </div>
        </div>
    )
}

export default CommunityNoteDisplay
