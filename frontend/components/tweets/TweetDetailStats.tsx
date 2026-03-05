'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchTweetQuotes } from '@/api-calls/tweets-api'
import { useInView } from 'react-intersection-observer'
import Tweet from '@/components/tweets/Tweet'
import { ITweetResponse } from '@/DTO/ITweetResponse'

type Props = {
  tweetId: number
  likesCount: number
  retweetsCount: number
  quotesCount: number
  bookmarksCount: number
  username: string
}

export default function TweetDetailStats({
  tweetId,
  likesCount,
  retweetsCount,
  quotesCount,
  bookmarksCount,
  username,
}: Props) {
  const [quotesOpen, setQuotesOpen] = useState(false)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['tweet-quotes', tweetId],
    queryFn: ({ pageParam }) =>
      fetchTweetQuotes({ tweetId, pageParam, pageSize: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage?.content?.length || lastPage.content.length < 20)
        return undefined
      return lastPageParam + 1
    },
    enabled: quotesOpen,
  })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (quotesOpen && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [quotesOpen, inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allQuotes: ITweetResponse[] =
    data?.pages?.flatMap((p) => p.content ?? []) ?? []

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 mt-3 text-[15px] text-muted-foreground border-b border-border pb-3">
        <span className="hover:underline">
          <strong className="text-foreground">{likesCount}</strong>{' '}
          {likesCount === 1 ? 'Like' : 'Likes'}
        </span>
        <span className="text-muted-foreground/60">·</span>
        <span className="hover:underline">
          <strong className="text-foreground">{retweetsCount}</strong>{' '}
          {retweetsCount === 1 ? 'Retweet' : 'Retweets'}
        </span>
        <span className="text-muted-foreground/60">·</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setQuotesOpen(true)
          }}
          className="hover:underline text-left"
        >
          <strong className="text-foreground">{quotesCount}</strong>{' '}
          {quotesCount === 1 ? 'Quote' : 'Quotes'}
        </button>
        <span className="text-muted-foreground/60">·</span>
        <span className="hover:underline">
          <strong className="text-foreground">{bookmarksCount}</strong>{' '}
          {bookmarksCount === 1 ? 'Bookmark' : 'Bookmarks'}
        </span>
      </div>

      <Dialog open={quotesOpen} onOpenChange={setQuotesOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] p-0 gap-0 border-gray-800 flex flex-col">
          <DialogTitle className="sr-only">Quotes</DialogTitle>
          <div className="p-3 border-b border-border font-semibold text-foreground">
            Quotes
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {status === 'pending' && (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            {status === 'success' && allQuotes.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                No quotes yet.
              </div>
            )}
            {allQuotes.length > 0 && (
              <div className="divide-y divide-border">
                {allQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <Tweet tweet={q} username={username} />
                  </div>
                ))}
              </div>
            )}
            <div ref={ref} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
