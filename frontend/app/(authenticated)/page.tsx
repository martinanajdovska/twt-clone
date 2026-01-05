import Link from 'next/link'
import {cookies} from 'next/headers';
import TweetForm from "@/components/tweet-components/TweetForm";
import Feed from "@/components/Feed";
import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import {fetchSelfUsername, fetchTweets} from "@/components/dataFetching";

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const queryClient = new QueryClient()

    if (!token) {
        return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h1 className="text-4xl font-bold">Welcome!</h1>
                    <div className="flex gap-4">
                        <Link href="/register" className="text-blue-500 hover:underline">Sign Up</Link>
                        <Link href="/login" className="text-blue-500 hover:underline">Sign In</Link>
                    </div>
                </div>

        )
    }

    const self = await fetchSelfUsername({token});
    const username = self.username;

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['feed', token],
        queryFn: ({ pageParam }) => fetchTweets({ pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < 5) {
                return undefined;
            }
            return lastPageParam + 1
        },
    })

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10">
            <section className="flex flex-col gap-6">

                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <TweetForm username={username}/>
                </div>

                <div className="flex flex-col">
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <Feed token={token} username={username} isProfile={false}/>
                    </HydrationBoundary>
                </div>

            </section>
        </div>
    )

}