'use client'

import React, { useState } from 'react'
import { Repeat2, Quote as QuoteIcon } from 'lucide-react'
import { useRetweet } from '@/hooks/tweets/useRetweet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Retweet from '@/components/tweets/Retweet'
import Quote from '@/components/tweets/Quote'
import { ITweetResponse } from '@/DTO/ITweetResponse'

type Props = {
  tweet: ITweetResponse
  username: string
  retweetsCount: number
  retweeted: boolean
}

const RetweetMenu = ({ tweet, username, retweetsCount, retweeted }: Props) => {
  const [retweetsCountState, setRetweetsCountState] = useState(retweetsCount)
  const [isRetweetedState, setIsRetweetedState] = useState(retweeted)
  const [quoteOpen, setQuoteOpen] = useState(false)

  const { mutate: doRetweet, isPending } = useRetweet(username)

  const handleRetweet = () => {
    const newState = !isRetweetedState
    setIsRetweetedState(newState)
    setRetweetsCountState((prev) => (newState ? prev + 1 : prev - 1))
    doRetweet(
      { id: tweet.id, isRetweeted: isRetweetedState },
      {
        onError: () => {
          setIsRetweetedState(!newState)
          setRetweetsCountState((prev) => (!newState ? prev + 1 : prev - 1))
          alert('Failed to retweet')
        },
      }
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <div>
            <Retweet
              retweetsCount={retweetsCountState}
              retweeted={isRetweetedState}
              isPending={isPending}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              handleRetweet()
            }}
            disabled={isPending}
          >
            <Repeat2 size={18} />
            Retweet
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setQuoteOpen(true)
            }}
          >
            <QuoteIcon size={18} />
            Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Quote
        tweet={tweet}
        username={username}
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
      />
    </>
  )
}

export default RetweetMenu
