import {cookies} from 'next/headers';
import TweetForm from "@/components/tweets/TweetForm";
import Feed from "@/components/Feed";
import React from "react";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import {fetchSelfUsername} from "@/api-calls/users-api";
import {redirect} from "next/navigation";
import {prefetchFeed} from "@/hooks/tweets/prefetchFeed";

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const queryClient = await prefetchFeed();

    if (!token) {
        redirect("/login");
    }

    const self = await fetchSelfUsername({token});
    const username = self.username;


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10">
            <section className="flex flex-col gap-6">
                FEED
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <TweetForm username={username}/>
                </div>

                <div className="flex flex-col">
                    <HydrationBoundary state={dehydrate(queryClient)}>

                        <Feed username={username} isProfile={false}/>
                    </HydrationBoundary>
                </div>

            </section>
        </div>
    )

}