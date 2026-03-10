'use client'

import React, { useState } from 'react'
import { Bookmark as BookmarkIcon } from 'lucide-react'
import { useBookmarkTweet } from '@/hooks/tweets/useBookmarkTweet'


const Bookmark = ({ id, isBookmarked, username }: {
  id: number
  isBookmarked: boolean
  username: string
}) => {
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked)
  const { mutate: toggleBookmark, isPending } = useBookmarkTweet(username)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isBookmarkedState
    setIsBookmarkedState(newState)
    toggleBookmark(
      { id, isBookmarked: isBookmarkedState },
      {
        onError: () => {
          setIsBookmarkedState(!newState)
          alert('Failed to update bookmark')
        },
      }
    )
  }

  return (
    <div className="flex items-center gap-1 group">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={`
          p-2 rounded-full transition-all duration-200
          ${isBookmarkedState
            ? 'text-amber-500 bg-amber-500/10'
            : 'text-muted-foreground group-hover:text-amber-500 group-hover:bg-amber-500/10'}
          ${isPending ? 'opacity-50' : 'active:scale-90'}
        `}
        aria-label={isBookmarkedState ? 'Remove bookmark' : 'Bookmark'}
      >
        <BookmarkIcon
          size={18}
          fill={isBookmarkedState ? 'currentColor' : 'none'}
          className={isPending ? 'animate-pulse' : ''}
        />
      </button>
    </div>
  )
}

export default Bookmark
