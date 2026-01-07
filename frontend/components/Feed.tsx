'use client'
import React, {useEffect} from "react";
import {ITweetResponse} from "@/DTO/ITweetResponse";
import Tweet from "@/components/tweets/Tweet";
import {useInView} from 'react-intersection-observer';
import {useFetchFeed} from "@/hooks/tweets/useFetchFeed";

export default function Feed({username, isProfile}: { username: string, isProfile: boolean }) {
    const {ref, inView} = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useFetchFeed({username, isProfile})

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
                                    <Tweet tweet={tweet} username={username}/>
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