'use client'
import React, {useEffect} from 'react'
import Tweet from "@/components/tweet-components/Tweet";
import TweetForm from "@/components/tweet-components/TweetForm";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import {useInfiniteQuery} from "@tanstack/react-query";
import {useInView} from "react-intersection-observer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchTweetInfo = async ({pageParam=0, id}:{pageParam:number, id:number}) => {
    const res = await fetch(`${BASE_URL}/api/tweets/${id}/details?page=${pageParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
    }

    const data = await res.json();
    return data;
}

const TweetDetails = ({id, username}:{id:number, username:string}) => {
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
        queryKey: ['tweet', id],
        queryFn: ({ pageParam }) => fetchTweetInfo({ pageParam , id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.replies.length < 5 ? undefined : lastPageParam + 1;
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

    const tweet = data.pages[0].tweet;

    return (
        <div className="w-full">
            <div className="flex flex-col">
                <div>
                    <Tweet tweet={tweet} username={username} />
                    <hr/>
                    <TweetForm username={username} parentId={tweet.id}/>
                    <hr/>
                </div>
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        <div className="divide-y border-x border-b border-border">
                            {group.replies.map((reply: ITweetResponse) => (
                                <div key={reply.id} className="transition-colors hover:bg-accent/50">
                                    <Tweet tweet={reply} username={username} />
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
export default TweetDetails
