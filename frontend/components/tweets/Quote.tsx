'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Tweet from '@/components/tweets/Tweet'
import TweetForm from '@/components/tweets/TweetForm'
import { ITweetResponse } from '@/DTO/ITweetResponse'
import { useQuery } from '@tanstack/react-query'
import { fetchSelfUsernameAndProfilePicture } from '@/api-calls/users-api'

type Props = {
    tweet: ITweetResponse
    username: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const Quote = ({ tweet, username, open: controlledOpen, onOpenChange }: Props) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? (onOpenChange ?? (() => { })) : setInternalOpen
    const { data: self } = useQuery({
        queryKey: ['self-info'],
        queryFn: () => fetchSelfUsernameAndProfilePicture({}),
        enabled: open,
    })

    const dialogContent = (
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 border-gray-800">
            <div className="p-4">
                <div className="mb-3">
                    <Tweet tweet={tweet} username={username} />
                </div>
                <div className="mt-2">
                    <TweetForm
                        username={username}
                        quoteId={tweet.id}
                        profilePicture={self?.profilePicture ?? undefined}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </div>
        </DialogContent>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <button className="flex items-center gap-1 group hover:text-purple-500 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-purple-500/10">
                            <span className="text-xs font-semibold uppercase tracking-wide">
                                Quote
                            </span>
                        </div>
                    </button>
                </DialogTrigger>
            )}
            {dialogContent}
        </Dialog>
    )
}

export default Quote

