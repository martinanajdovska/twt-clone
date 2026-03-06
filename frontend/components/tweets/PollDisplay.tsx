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
      className="poll-card"
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-label="Poll"
    >
      <div className="poll-card-header">
        <div className="poll-card-header-icon">
          <BarChart3 size={18} strokeWidth={2} />
        </div>
        <span className="poll-card-header-label">Poll</span>
        {!ended && (
          <span className="poll-card-header-count">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="poll-card-options">
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
                'poll-card-option',
                canVote && 'poll-card-option--votable',
                isSelected && 'poll-card-option--selected'
              )}
            >
              {showBar && (
                <span
                  className={cn(
                    'poll-card-option-bar',
                    isSelected ? 'poll-card-option-bar--selected' : 'poll-card-option-bar--other'
                  )}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              )}
              {canVote && (
                <span className="poll-card-option-radio" aria-hidden>
                  {isSelected && <span className="poll-card-option-radio-dot" />}
                </span>
              )}
              <span className="poll-card-option-content">
                <span className="poll-card-option-label">{option.label}</span>
                {(hasVoted || ended) && (
                  <span className="poll-card-option-stats">
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

      <div className="poll-card-footer">
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
