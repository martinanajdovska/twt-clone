'use client'
import {useInfiniteQuery} from '@tanstack/react-query'
import React, {useEffect} from "react";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Tweet from "@/components/Tweet";
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

    return status === 'pending' ? (
        <p>Loading...</p>
    ) : status === 'error' ? (
        <p>Error: {error.message}</p>
    ) : (
        <>
            {data.pages.map((group, i) => (
                <React.Fragment key={i}>
                    <ul key={i} className="m-0 p-0 list-none">
                        {group.map((tweet: ITweetResponse) => (
                            <li key={tweet.id} className="mb-3 tweet">
                                <Tweet {...tweet} />
                            </li>
                        ))}
                    </ul>
                </React.Fragment>
            ))}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage ? (
                    <p>Loading more...</p>
                ) : (
                    <p>You've reached the end!</p>
                )}
            </div>
        </>
    )
}