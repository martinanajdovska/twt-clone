import Link from 'next/link'

import Layout from '../components/layout'
import {cookies} from 'next/headers';
import Logout from "@/components/Logout";
import TweetForm from "@/components/TweetForm";
import Feed, {fetchTweets} from "@/components/Feed";
import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const queryClient = new QueryClient()

    if (!token) {
        return (
            <div>
                <Layout>
                    <h1>Welcome!</h1>
                    <p><Link href="/register">Sign Up</Link></p>
                    <p><Link href="/login">Sign In</Link></p>
                </Layout>
            </div>
        )
    }

    await queryClient.prefetchInfiniteQuery({
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

    return (
        <div className="container-fluid pt-5">
            <Logout/>
            <section className="row">
                <div className="col-4">
                    Profile info
                </div>
                <div className="col-8">
                    <TweetForm token={token} />
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <Feed token={token} />
                    </HydrationBoundary>
                </div>
            </section>
        </div>
    )

}