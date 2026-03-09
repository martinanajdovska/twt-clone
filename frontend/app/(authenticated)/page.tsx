import { cookies } from 'next/headers';
import TweetForm from "@/components/tweets/TweetForm";
import Feed from "@/components/tweets/Feed";
import React from "react";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { fetchSelfUsernameAndProfilePicture } from "@/api-calls/users-api";
import { redirect } from "next/navigation";
import { prefetchFeed } from "@/hooks/tweets/prefetchFeed";

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const queryClient = await prefetchFeed();

    if (!token) {
        redirect("/login");
    }

    const self = await fetchSelfUsernameAndProfilePicture({ token });
    const username = self.username;


    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 hidden md:flex items-center px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
                <h1 className="text-xl font-bold text-foreground">Home</h1>
            </header>
            <div className="border-b border-border">
                <TweetForm username={username} profilePicture={self.profilePicture} />
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Feed username={username} isProfile={false} />
            </HydrationBoundary>
        </div>
    )

}