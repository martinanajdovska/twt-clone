'use client'

import React, { useEffect } from 'react'
import { ITweetResponse } from '@/DTO/ITweetResponse'
import Tweet from '@/components/tweets/Tweet'
import { useInView } from 'react-intersection-observer'
import { useFetchBookmarks } from '@/hooks/tweets/useFetchBookmarks'

export default function BookmarksFeed({ username }: { username: string }) {
  const { ref, inView } = useInView()
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useFetchBookmarks()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (status === 'pending') {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className="text-destructive text-center p-4 font-medium">
        Error: {error?.message}
      </p>
    )
  }

  const allTweets = data?.pages.flat() ?? []

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {allTweets.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No bookmarks yet. Click the bookmark icon on a tweet to save it here.
          </p>
        ) : (
          data?.pages.map((group, i) => (
            <React.Fragment key={i}>
              <div className="divide-y border-x border-b border-border">
                {(group as ITweetResponse[]).map((tweet: ITweetResponse) => (
                  <div
                    key={`${tweet.id}-${tweet.retweetedBy ?? ''}`}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <Tweet tweet={tweet} username={username} />
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      <div
        ref={ref}
        className="py-8 flex justify-center items-center text-muted-foreground text-sm"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            <span>Loading more...</span>
          </div>
        ) : hasNextPage ? (
          <span>Scroll for more</span>
        ) : allTweets.length > 0 ? (
          <span className="italic font-light">You&apos;ve reached the end</span>
        ) : null}
      </div>
    </div>
  )
}
