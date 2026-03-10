'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { ITweetResponse } from '@/DTO/ITweetResponse'
import { useVotePoll } from '@/hooks/tweets/useVotePoll'
import { cn } from '@/lib/utils'

type Poll = NonNullable<ITweetResponse['poll']>

const PollDisplay = ({
  tweetId,
  poll,
  username,
}: {
  tweetId: number
  poll: Poll
  username: string
}) => {
  const { mutate: vote, isPending } = useVotePoll(tweetId, username)
  const ended = new Date(poll.endsAt) <= new Date()
  const hasVoted = poll.selectedOptionId != null
  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0)
  const canVote = !ended && !hasVoted && !isPending

  const handleOptionClick = (e: React.MouseEvent, optionId: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!canVote) return

    vote(optionId)
  }

  return (
    <div
      className="mt-3 w-full rounded-2xl border border-border overflow-hidden bg-muted/50 dark:bg-[#16181c]"
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label="Poll"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/80 dark:bg-[#2f3336]">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 text-foreground">
          <BarChart3 size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold text-foreground">Poll</span>
        {!ended && (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        {poll.options.map((option) => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = option.id === poll.selectedOptionId
          const showBar = hasVoted || ended

          return (
            <button
              key={option.id}
              type="button"
              disabled={!canVote}
              onClick={(e) => handleOptionClick(e, option.id)}
              className={cn(
                'w-full min-h-[52px] px-4 py-3.5 rounded-xl border-2 text-left flex items-center relative overflow-hidden transition-[border-color,background-color] duration-150',
                canVote && 'cursor-pointer border-border bg-background dark:bg-[#1f1f1f] hover:border-black/15 hover:bg-black/[0.02] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]',
                isSelected && 'border-foreground bg-black/[0.04] dark:border-white dark:bg-white/[0.06] ring-2 ring-black/10 dark:ring-white/15'
              )}
            >
              {showBar && (
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-l-xl rounded-r-lg transition-[width] duration-300',
                    isSelected ? 'bg-black/20 dark:bg-white/20' : 'bg-black/10 dark:bg-white/10'
                  )}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
              {canVote && (
                <span
                  className="shrink-0 w-5 h-5 mr-3 rounded-full border-2 border-black/25 dark:border-white/40 bg-background dark:bg-[#1f1f1f] flex items-center justify-center"
                  aria-hidden
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-foreground dark:bg-white" />
                  )}
                </span>
              )}
              <span className="relative z-10 flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {option.label}
                </span>
                {(hasVoted || ended) && (
                  <span className="text-sm text-muted-foreground shrink-0 tabular-nums">
                    {totalVotes > 0 ? `${pct.toFixed(0)}%` : '0%'}
                    {option.votes > 0 && (
                      <> · {option.votes} vote{option.votes !== 1 ? 's' : ''}</>
                    )}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/80 dark:bg-[#2f3336] text-[13px] text-muted-foreground">
        {ended ? (
          <span>Poll ended</span>
        ) : hasVoted ? (
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        ) : (
          <span>Tap an option to vote</span>
        )}
      </div>
    </div>
  )
}

export default PollDisplay
