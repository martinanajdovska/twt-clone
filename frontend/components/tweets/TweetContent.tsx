'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const MENTION_REGEX = /@(\w+)/g

export default function TweetContent({ content }: { content: string }) {
  const router = useRouter()

  const handleMentionClick = (e: React.MouseEvent, username: string) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/users/${username}`)
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags)
  while ((match = re.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    const mentionUsername = match[1]
    parts.push(
      <span
        key={match.index}
        onClick={(e) => {
          handleMentionClick(e, mentionUsername)
        }}
        className="text-primary font-medium bg-primary/10 hover:bg-primary/20 hover:underline cursor-pointer rounded px-0.5"
      >
        @{mentionUsername}
      </span>,
    )
    lastIndex = re.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return (
    <span className="text-[15px] leading-normal text-foreground whitespace-pre-wrap">
      {parts.length > 0 ? parts : content}
    </span>
  )
}
