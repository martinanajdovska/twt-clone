'use client'
import {useInfiniteQuery} from '@tanstack/react-query'
import React, {useEffect} from "react";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Tweet from "@/components/tweet-components/Tweet";
import {useInView} from 'react-intersection-observer';
import {fetchProfileFeed, fetchTweets} from "@/components/dataFetching";

export default function Feed({token, username = ""}: { token: string, username: string }) {
    const {ref, inView} = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        // check if trying to load a user profile (username!="") or normal feed
        // and use the relevant key and function
        queryKey: username !== "" ? ['profile', username] : ['feed', token],
        queryFn: async ({ pageParam }) => {
            const res = username
                ? await fetchProfileFeed({ pageParam, username })
                : await fetchTweets({ pageParam });
            // normalize the api response
            return Array.isArray(res) ? res : res.tweets;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.length < 5 ? undefined : lastPageParam + 1;
        },
    })

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
            <div className="flex flex-col">
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        <div className="divide-y border-x border-b border-border">
                            {group.map((tweet: ITweetResponse) => (
                                <div key={tweet.id} className="transition-colors hover:bg-accent/50">
                                    <Tweet {...tweet} />
                                    <hr/>
                                </div>
                            ))}
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
                    <span className="italic font-light">You&apos;ve reached the end of the feed</span>
                )}
            </div>
        </div>
    )
}