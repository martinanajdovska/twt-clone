import React from 'react'
import {cookies} from "next/headers";
import {dehydrate, HydrationBoundary} from "@tanstack/react-query";
import {fetchSelfUsernameAndProfilePicture} from "@/api-calls/users-api";
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

    const self = await fetchSelfUsernameAndProfilePicture({token});
    const isSelf = self.username === username;

    return (
        <main className="min-h-screen max-w-[600px] mx-auto border-x border-border">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProfileHeader
                    token={token}
                    username={username}
                    isSelf={isSelf}
                />

                {isSelf && (
                    <div className="border-b border-border">
                        <TweetForm username={self.username} profilePicture={self.profilePicture} />
                    </div>
                )}

                <Feed username={username} isProfile={true} />
            </HydrationBoundary>
        </main>
    )
}
export default ProfilePage
