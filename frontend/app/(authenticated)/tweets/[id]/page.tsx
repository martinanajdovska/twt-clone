import React from 'react'
import TweetDetails from "@/components/tweets/TweetDetails";
import { fetchSelfUsernameAndProfilePicture } from "@/api-calls/users-api";
import { cookies } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prefetchTweetDetails } from "@/hooks/tweets/prefetchTweetDetails";

const TweetDetailsPage = async ({ params }: { params: Promise<{ id: number }> }) => {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const queryClient = await prefetchTweetDetails(id);
    let username = '';
    let profilePicture: string | null = null;

    if (token) {
        const self = await fetchSelfUsernameAndProfilePicture({ token });
        username = self.username;
        profilePicture = self.profilePicture;
    }

    return (
        <div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <TweetDetails id={id} username={username} profilePicture={profilePicture} />
            </HydrationBoundary>
        </div>
    )
}
export default TweetDetailsPage
