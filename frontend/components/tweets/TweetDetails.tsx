'use client'
import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Tweet from '@/components/tweets/Tweet'
import TweetForm from '@/components/tweets/TweetForm'
import { ITweetResponse } from '@/DTO/ITweetResponse'
import { useInView } from 'react-intersection-observer'
import { useFetchTweetDetails } from '@/hooks/tweets/useFetchTweetDetails'

const TweetDetails = ({ id, username, profilePicture }: { id: number; username: string; profilePicture: string | null }) => {
    const queryClient = useQueryClient()
    const { ref, inView } = useInView()

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useFetchTweetDetails(id);

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

    const tweet = data.pages[0].tweet;
    const parentTweet = data.pages[0].parentTweet;

    return (
        <div className="w-full pb-2">
            <div className="flex flex-col">
                <div>
                    {parentTweet && (
                        <div className="relative">
                            <div className="absolute left-[36px] top-[32px] bottom-0 w-[2px] bg-border" aria-hidden />
                            <Tweet tweet={parentTweet} username={username} />
                        </div>
                    )}
                    <div className="relative">
                        <div className="absolute left-[36px] top-10 bottom-0 w-[2px] bg-border" aria-hidden />
                        <Tweet tweet={tweet} username={username} detailView />
                    </div>

                    <div className="border-b border-border relative">
                        <div className="absolute left-[36px] top-0 bottom-0 w-[2px] bg-border" aria-hidden />
                        <TweetForm
                            username={username}
                            parentId={tweet.id}
                            profilePicture={profilePicture ?? undefined}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tweet', String(id)] })}
                        />
                    </div>
                </div>
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col divide-y divide-border">
                            {group.replies.map((reply: ITweetResponse, replyIndex: number) => {
                                const isLast = replyIndex === group.replies.length - 1
                                return (
                                    <div
                                        key={reply.id}
                                        className="relative transition-colors hover:bg-white/50 dark:hover:bg-white/[0.03]"
                                    >
                                        <div className="absolute left-[36px] top-0 bottom-0 w-[2px] bg-border" aria-hidden />
                                        <Tweet tweet={reply} username={username} />
                                    </div>
                                )
                            })}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div ref={ref} className="py-8 flex justify-center items-center text-muted-foreground text-sm">
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span>Loading more tweets...</span>
                    </div>
                ) : hasNextPage ? (
                    <span>Scroll for more</span>
                ) : (
                    <span className="italic font-light">You&apos;ve reached the end</span>
                )}
            </div>
        </div>
    )
}
export default TweetDetails
