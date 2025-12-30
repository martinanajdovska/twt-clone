'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import React, {useEffect} from "react";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Tweet from "@/components/Tweet";
import { useInView } from 'react-intersection-observer';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchTweets = async ({ pageParam = 0, token }: {pageParam:number, token:string}) => {
    const response = await fetch(`${BASE_URL}/api/tweets?page=${pageParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error("Failed to fetch tweets");
    const data = await response.json();
    return data;
}

export default function Feed({ token }: { token: string }) {
    const { ref, inView } = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['tweets', token],
        queryFn: ({ pageParam }) => fetchTweets({ pageParam, token }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < 5) {
                return undefined;
            }
            return lastPageParam + 1
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
                    <ul className="m-0 p-0">
                        {group.map((tweet:ITweetResponse) => (
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