'use client'
import React, { useEffect } from 'react'
import { ITweetResponse } from '@/DTO/ITweetResponse'
import Tweet from '@/components/tweets/Tweet'
import { useInView } from 'react-intersection-observer'
import { useFetchFeed } from '@/hooks/tweets/useFetchFeed'

export default function Feed({
    username,
    isProfile,
    profileTab = 'tweets',
    profileUsername,
}: {
    username: string
    isProfile: boolean
    profileTab: string
    profileUsername: string
}) {
    const { ref, inView } = useInView()

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useFetchFeed({ username, isProfile, profileTab, profileUsername })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === 'pending') {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === 'error') {
        return <p className="text-destructive text-center p-4 font-medium">Error: {error.message}</p>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col divide-y divide-border">
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        {group.map((tweet: ITweetResponse, j) => (
                            <div
                                key={`${i}-${j}-${tweet.id}`}
                                className="transition-colors hover:bg-white/50 dark:hover:bg-white/[0.03]"
                            >
                                <Tweet tweet={tweet} username={username} showPinnedLabel={isProfile} />
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>

            <div ref={ref} className="py-8 flex justify-center items-center text-muted-foreground text-sm">
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        <span>Loading more tweets...</span>
                    </div>
                ) : hasNextPage ? (
                    <span>Scroll for more</span>
                ) : (
                    <span className="italic font-light">You&apos;ve reached the end of the feed</span>
                )}
            </div>
        </div>
    )
}