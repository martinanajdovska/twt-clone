'use client'
import Follow from "@/components/Follow";
import React from "react";
import {useQuery} from "@tanstack/react-query";
import {fetchProfileInfo} from "@/components/dataFetching";

const ProfileHeader =  ({username, token, isSelf}: {username:string, token:string, isSelf:boolean}) => {
    const { data, isLoading } = useQuery({
        queryKey: ['profileHeader', username],
        queryFn: () => fetchProfileInfo({username, token}),
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="bg-card border-x border-b border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl tracking-tight font-bold">{username}</h1>
                    {data.isFollowingYou && (
                        <p className="inline-block bg-muted text-muted-foreground text-[11px] px-1.5 py-0.5 rounded font-medium mt-1 uppercase tracking-wider">
                            Follows you
                        </p>
                    )}
                </div>

                {!isSelf && (
                    <div className="shrink-0">
                        <Follow username={username} isFollowed={data.followed} token={token} />
                    </div>
                )}
            </div>

            <div className="flex gap-6 items-center pt-2">
                <div className="flex gap-1 items-center hover:underline cursor-pointer decoration-muted-foreground/50">
                    <span className="font-bold text-foreground">{data.following}</span>
                    <span className="text-muted-foreground text-sm">Following</span>
                </div>
                <div className="flex gap-1 items-center hover:underline cursor-pointer decoration-muted-foreground/50">
                    <span className="font-bold text-foreground">{data.followers}</span>
                    <span className="text-muted-foreground text-sm">Followers</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;