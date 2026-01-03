import React from 'react'
import Link from "next/link";
import TweetForm from "@/components/tweet-components/TweetForm";
import Feed from "@/components/Feed";
import { cookies } from "next/headers";
import { fetchProfileFeed, fetchSelfUsername } from "@/components/dataFetching";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProfileHeader from "@/components/ProfileHeader";

const Profile = async ({username}: {username:string}) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const queryClient = new QueryClient()


    if (!token) {
        return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <h1 className="text-3xl font-bold">Welcome!</h1>
                    <div className="flex gap-4">
                        <Link href="/register" className="text-primary hover:underline font-medium">Sign Up</Link>
                        <Link href="/login" className="text-primary hover:underline font-medium">Sign In</Link>
                    </div>
                </div>
        )
    }

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['profile', username],
        queryFn: ({ pageParam }) => fetchProfileFeed({ pageParam, username }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.length < 5 ? undefined : lastPageParam + 1;
        },
    })

    const self = await fetchSelfUsername({token});
    const isSelf = self.username === username;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <section className="col-span-12 space-y-6">
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <ProfileHeader
                            token={token}
                            username={username}
                            isSelf={isSelf}
                        />

                        {isSelf && (
                            <div className="border-b border-border">
                                <TweetForm token={token} username={username}/>
                            </div>
                        )}

                        <Feed token={token} username={username} />
                    </HydrationBoundary>
                </section>
            </div>
        </main>
    )
}
export default Profile
