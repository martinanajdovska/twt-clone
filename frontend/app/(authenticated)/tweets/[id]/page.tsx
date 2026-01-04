import React from 'react'
import TweetDetails, {fetchTweetInfo} from "@/components/tweet-components/TweetDetails";
import {fetchSelfUsername, fetchTweets} from "@/components/dataFetching";
import {cookies} from "next/headers";
import Link from "next/link";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";


const TweetDetailsPage = async ({params}: { params: Promise<{ id: number }> }) => {
    const {id} = await params;
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

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['tweet', id],
        queryFn: ({pageParam}) => fetchTweetInfo({pageParam, id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < 5) {
                return undefined;
            }
            return lastPageParam + 1
        },
    })

    const self = await fetchSelfUsername({token});
    const username = self.username;

    return (
        <div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <TweetDetails id={id} username={username}/>
            </HydrationBoundary>
        </div>
    )
}
export default TweetDetailsPage
