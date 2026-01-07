import React from 'react'
import TweetDetails from "@/components/tweets/TweetDetails";
import {fetchSelfUsername} from "@/api-calls/users-api";
import {cookies} from "next/headers";
import {dehydrate, HydrationBoundary} from "@tanstack/react-query";
import {redirect} from "next/navigation";
import {prefetchTweetDetails} from "@/hooks/tweets/prefetchTweetDetails";

const TweetDetailsPage = async ({params}: { params: Promise<{ id: number }> }) => {
    const {id} = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const queryClient = await prefetchTweetDetails(id);

    if (!token) {
        redirect("/login");
    }

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
