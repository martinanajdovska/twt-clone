'use client'
import { ITweetResponse } from "@/dtos/ITweetResponse";
import Image from "next/image";
import React from "react";
import Like from "./Like";
import Retweet from "@/components/tweet-components/Retweet";
import { useRouter } from "next/navigation";
import { Repeat2} from "lucide-react";

import Delete from "@/components/tweet-components/Delete";
import Reply from "@/components/tweet-components/Reply";

const Tweet = ({ tweet, username}: { tweet: ITweetResponse, username: string }) => {
    const router = useRouter();

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/users/${tweet.username}`);
    };

    const showTweetInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/tweets/${tweet.id}`);
    }

    const isSelf = username === tweet.username;

    return (
        <article
            className="flex flex-col p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group">
            {(tweet.retweeted || tweet.retweetedBy) && (
                <div className="flex items-center gap-2 ml-8 mb-1 text-muted-foreground">
                    <Repeat2 size={14} className="font-bold" />
                    <span className="text-[13px] font-bold hover:underline">{tweet.retweeted?"You":tweet.retweetedBy} retweeted</span>
                </div>
            )}

            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div
                        onClick={handleUserClick}
                        className="h-10 w-10 rounded-full bg-accent flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-sm"
                    >
                        {tweet.username.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span
                                onClick={handleUserClick}
                                className="font-bold text-foreground hover:underline cursor-pointer"
                            >
                                {tweet.username}
                            </span>
                            <span className="text-muted-foreground text-sm">@{tweet.username.toLowerCase()}</span>
                        </div>
                        {isSelf&&<Delete username={username} id={tweet.id} parentId={tweet.parentId} />}
                    </div>

                    <div onClick={showTweetInfo}
                        className="mt-1 text-[15px] leading-normal text-foreground whitespace-pre-wrap">
                        {tweet.content}
                    </div>

                    {tweet.imageUrl && (
                        <div className="relative mt-3 rounded-2xl overflow-hidden border border-border aspect-video">
                            <Image
                                src={tweet.imageUrl}
                                alt="Tweet image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between max-w-md mt-3 -ml-2 text-muted-foreground">
                        <Reply tweet={tweet} username={username} repliesCount={tweet.repliesCount} />
                        <Retweet retweetsCount={tweet.retweetsCount} retweeted={tweet.retweeted} id={tweet.id} username={username} />
                        <Like likesCount={tweet.likesCount} liked={tweet.liked} id={tweet.id} />
                    </div>
                </div>
            </div>
        </article>
    );
}

export default Tweet