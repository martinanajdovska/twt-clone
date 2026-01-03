import { ITweetResponse } from "@/dtos/ITweetResponse";
import Image from "next/image";
import React from "react";
import Like from "../components/Like";
import Retweet from "@/components/Retweet";
import { useRouter } from "next/navigation";
import { MessageCircle, MoreHorizontal, Repeat2 } from "lucide-react";

const Tweet = ({ id, username, content, imageUrl, likesCount, repliesCount, retweetsCount, liked, retweeted }: ITweetResponse) => {
    // TODO: show replies when user clicks on tweet
    // TODO: handle clicking the button for replying
    const router = useRouter();


    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/users/${username}`);
    };

    return (
        <article className="flex flex-col p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group">
            {retweeted && (
                <div className="flex items-center gap-2 ml-8 mb-1 text-muted-foreground">
                    <Repeat2 size={14} className="font-bold" />
                    <span className="text-[13px] font-bold hover:underline">You retweeted</span>
                </div>
            )}

            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div
                        onClick={handleUserClick}
                        className="h-10 w-10 rounded-full bg-accent flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-sm"
                    >
                        {username.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span
                                onClick={handleUserClick}
                                className="font-bold text-foreground hover:underline cursor-pointer"
                            >
                                {username}
                            </span>
                            <span className="text-muted-foreground text-sm">@{username.toLowerCase()}</span>
                        </div>
                        {/*TODO: add delete button*/}
                        <button className="text-muted-foreground hover:text-primary p-1 rounded-full hover:bg-primary/10 transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div className="mt-1 text-[15px] leading-normal text-foreground whitespace-pre-wrap">
                        {content}
                    </div>

                    {imageUrl && (
                        <div className="relative mt-3 rounded-2xl overflow-hidden border border-border aspect-video">
                            <Image
                                src={imageUrl}
                                alt="Tweet image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between max-w-md mt-3 -ml-2 text-muted-foreground">
                        <div className="flex items-center gap-1 group/reply hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover/reply:bg-blue-500/10">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-sm">{repliesCount}</span>
                        </div>

                        <Retweet retweetsCount={retweetsCount} retweeted={retweeted} id={id} />
                        <Like likesCount={likesCount} liked={liked} id={id} />
                    </div>
                </div>
            </div>
        </article>
    );
}

export default Tweet