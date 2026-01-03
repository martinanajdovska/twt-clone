import Follow from "@/components/Follow";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


const Profile = async ({username, token, isSelf}: {username:string, token:string, isSelf:boolean}) => {


    const fetchInfo = async () => {
        const response = await fetch(`${BASE_URL}/api/users/${username}/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error getting user data');
        }

        const data = await response.json();
        return data;
    }



    const data = await fetchInfo();
    console.log(data);

    return (
        <div className="bg-card border-x border-b border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl tracking-tight font-bold">{username}</h1>
                    {data.isFollowingYou && (
                        <span className="inline-block bg-muted text-muted-foreground text-[11px] px-1.5 py-0.5 rounded font-medium mt-1 uppercase tracking-wider">
                            Follows you
                        </span>
                    )}
                </div>

                {!isSelf && (
                    <div className="shrink-0">
                        <Follow username={username} isFollowed={data.followed} />
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

export default Profile;