'use client'

import React from "react"
import { useRateNote } from "@/hooks/community-notes/useRateNote"

type Note = { id: number; content: string }

const CommunityNoteDisplay = ({ note }: { note: Note | null }) => {
    const { mutate: rateNote } = useRateNote()

    if (!note) return null

    return (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-500 p-3 mt-2 text-sm rounded-r">
            <span className="font-bold">Community Note</span>
            <p className="mt-1">{note.content}</p>
            <div className="flex gap-4 mt-2 text-gray-500 dark:text-gray-400">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        rateNote({ noteId: note.id, helpful: true })
                    }}
                    className="hover:underline"
                >
                    Helpful
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        rateNote({ noteId: note.id, helpful: false })
                    }}
                    className="hover:underline"
                >
                    Not helpful
                </button>
            </div>
        </div>
    )
}

export default CommunityNoteDisplay
