'use client'
import React, {useEffect} from 'react'
import Tweet from "@/components/tweets/Tweet";
import TweetForm from "@/components/tweets/TweetForm";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import {useInView} from "react-intersection-observer";
import {useFetchTweetDetails} from "@/hooks/tweets/useFetchTweetDetails";

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
        <div className="w-full">
            <div className="flex flex-col">
                <div>
                    {parentTweet && (
                        <div className="relative">
                            <div className="absolute left-[20px] top-[40px] bottom-0 w-[2px] bg-border shadow-sm" />

                            <Tweet tweet={parentTweet} username={username} />
                        </div>
                    )}
                    <Tweet tweet={tweet} username={username} />

                    <TweetForm username={username} parentId={tweet.id}/>

                </div>
                {data.pages.map((group, i) => (
                    <React.Fragment key={i}>
                        <div className="divide-y border-x border-b border-border">
                            {group.replies.map((reply: ITweetResponse) => (
                                <div key={reply.id} className="transition-colors hover:bg-accent/50">
                                    <Tweet tweet={reply} username={username} />

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
