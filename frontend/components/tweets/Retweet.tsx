'use client'

import React from 'react'
import { Repeat2 } from 'lucide-react'

type Props = {
  retweetsCount: number
  isRetweeted: boolean
  isPending: boolean
  onRetweet?: () => void
  hideCount: boolean
}

const Retweet = ({
  retweetsCount,
  isRetweeted,
  isPending,
  onRetweet,
  hideCount = false,
}: Props) => {
  const content = (
    <>
      <button
        type="button"
        disabled={isPending}
        className={`
          p-2 rounded-full transition-all duration-200
          ${isRetweeted
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'text-muted-foreground group-hover:text-emerald-500 group-hover:bg-emerald-500/10'}
          ${isPending ? 'opacity-50' : 'active:scale-90'}
        `}
        aria-label={isRetweeted ? 'Undo Retweet' : 'Retweet'}
        onClick={(e) => {
          e.stopPropagation()
          onRetweet?.()
        }}
      >
        <Repeat2
          size={18}
          className={`transition-transform duration-300 ${isRetweeted ? 'rotate-180' : 'rotate-0'
            } ${isPending ? 'animate-pulse' : ''}`}
          fill={isRetweeted ? 'green' : 'none'}
        />
      </button>
      {!hideCount && (
        <span
          className={`text-sm font-medium transition-colors ${isRetweeted
            ? 'text-emerald-500'
            : 'text-muted-foreground group-hover:text-emerald-500'
            }`}
        >
          {retweetsCount}
        </span>
      )}
    </>
  )

  return <div className="flex items-center gap-1 group">{content}</div>
}

export default Retweet
