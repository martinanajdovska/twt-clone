import React from 'react'
import { cookies } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchSelfUsernameAndProfilePicture } from "@/api-calls/users-api";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePageWrapper from "@/contexts/ProfilePageWrapper";
import TweetForm from "@/components/tweets/TweetForm";
import ProfileFeed from "@/components/profile/ProfileFeed";
import { redirect } from "next/navigation";
import { prefetchProfile } from "@/hooks/users/prefetchProfile";

const ProfilePage = async ({ params }: { params: Promise<{ username: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const { username } = await params

    if (!token) {
        redirect("/login");
    }

    const queryClient = await prefetchProfile({ username, token });
    const self = await fetchSelfUsernameAndProfilePicture({ token });
    const isSelf = self.username === username;

    return (
        <div className="min-h-screen">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProfilePageWrapper username={username}>
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

                    <ProfileFeed profileUsername={username} currentUsername={self.username} />
                </ProfilePageWrapper>
            </HydrationBoundary>
        </div>
    )
}
export default ProfilePage
