import React from 'react'
import {cookies} from "next/headers";
import {dehydrate, HydrationBoundary} from "@tanstack/react-query";
import {fetchSelfUsername} from "@/api-calls/users-api";
import ProfileHeader from "@/components/ProfileHeader";
import TweetForm from "@/components/tweets/TweetForm";
import Feed from "@/components/Feed";
import {redirect} from "next/navigation";
import {prefetchProfile} from "@/hooks/prefetchProfile";

const ProfilePage = async ({ params }: { params: Promise<{ username: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const {username} = await params

    if (!token) {
        redirect("/login");
    }

    const queryClient = await prefetchProfile({username, token});

    const self = await fetchSelfUsername({token});
    const isSelf = self.username === username;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <section className="col-span-12 space-y-6">
                    PROFILE
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <ProfileHeader
                            token={token}
                            username={username}
                            isSelf={isSelf}
                        />

                        {isSelf && (
                            <div className="border-b border-border shadow-sm">
                                <TweetForm username={self.username}/>
                            </div>
                        )}

                        <Feed username={username} isProfile={true}/>
                    </HydrationBoundary>
                </section>
            </div>
        </main>
    )
}
export default ProfilePage
