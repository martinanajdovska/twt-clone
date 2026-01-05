import React from 'react'
import {cookies} from "next/headers";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import Link from "next/link";
import {fetchProfileFeed, fetchProfileInfo, fetchSelfUsername} from "@/components/dataFetching";
import ProfileHeader from "@/components/ProfileHeader";
import TweetForm from "@/components/tweet-components/TweetForm";
import Feed from "@/components/Feed";

const ProfilePage = async ({ params }: { params: Promise<{ username: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const queryClient = new QueryClient()

    const {username} = await params

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

    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: ['profile', username],
            queryFn: ({ pageParam }) => fetchProfileFeed({ pageParam, username }),
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages, lastPageParam) => {
                return lastPage.length < 5 ? undefined : lastPageParam + 1;
            },
        }),
        queryClient.prefetchQuery({
            queryKey: ['profileHeader', username],
            queryFn: () => fetchProfileInfo({username, token}),
        }),
    ]);

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
                                <TweetForm username={self.username}/>
                            </div>
                        )}

                        <Feed token={token} username={username} isProfile={true}/>
                    </HydrationBoundary>
                </section>
            </div>
        </main>
    )
}
export default ProfilePage
