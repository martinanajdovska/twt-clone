'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TweetForm from '@/components/tweets/TweetForm'

export default function ReplyFooter({
  username,
  parentId,
  profilePicture,
  onReplySuccess,
}: {
  username: string
  parentId: number
  profilePicture: string | null
  onReplySuccess?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const handleSuccess = () => {
    setExpanded(false)
    onReplySuccess?.()
  }

  return (
    <>
      <div className="fixed left-0 right-0 z-30 border-t border-border bg-background bottom-16 md:bottom-0">
        <div className="w-full max-w-[600px] mx-auto">
          {expanded ? (
            <div className="relative max-h-[85vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <TweetForm
                username={username}
                parentId={parentId}
                profilePicture={profilePicture ?? undefined}
                onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={profilePicture ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-accent flex items-center justify-center font-bold text-sm">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[15px] text-muted-foreground flex-1">
                Post your reply
              </span>
            </button>
          )}
        </div>
      </div>
      {/* spacer so page content isn't hidden behind the footer when collapsed */}
      <div className="h-14 md:h-14" aria-hidden />
    </>
  )
}
