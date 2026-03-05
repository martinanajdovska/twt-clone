'use client'

import { ITweetResponse } from "@/DTO/ITweetResponse"
import Image from "next/image"
import React from "react"
import Like from "./Like"
import Bookmark from "./Bookmark"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Repeat2 } from "lucide-react"

import Delete from "@/components/tweets/Delete"
import Reply from "@/components/tweets/Reply"
import TweetContent from "@/components/tweets/TweetContent"
import AddCommunityNote from "@/components/community-notes/AddCommunityNote"
import AllCommunityNotesDialog from "@/components/community-notes/AllCommunityNotesDialog"
import CommunityNoteDisplay from "@/components/community-notes/CommunityNoteDisplay"
import RetweetMenu from "@/components/tweets/RetweetMenu"
import { formatRelativeTime } from "@/lib/relativeTime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Tweet = ({ tweet, username }: { tweet: ITweetResponse; username: string }) => {
    const router = useRouter()
    const isSelf = username === tweet.username

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/users/${tweet.username}`)
    }

    const showTweetInfo = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/tweets/${tweet.id}`)
    }

    return (
        <article className="flex flex-col p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group shadow-sm">
            {(tweet.retweeted || tweet.retweetedBy) && (
                <div className="flex items-center gap-2 ml-8 mb-1 text-muted-foreground">
                    <Repeat2 size={14} className="font-bold" />
                    <span className="text-[13px] font-bold hover:underline">
                        {tweet.retweeted ? "You" : tweet.retweetedBy} retweeted
                    </span>
                </div>
            )}

            <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10" onClick={handleUserClick}>
                    <Avatar className="h-full w-full">
                        <AvatarImage src={tweet.profilePictureUrl} className="object-cover" />
                        <AvatarFallback className="bg-accent flex items-center justify-center font-bold text-sm">
                            {tweet.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span
                                onClick={handleUserClick}
                                className="font-bold text-foreground hover:underline cursor-pointer"
                            >
                                {tweet.username}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                @{tweet.username.toLowerCase()}
                            </span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <AddCommunityNote tweetId={tweet.id} />
                                <AllCommunityNotesDialog tweetId={tweet.id} />
                                {isSelf && (
                                    <Delete
                                        username={username}
                                        id={tweet.id}
                                        parentId={tweet.parentId}
                                    />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div
                        onClick={showTweetInfo}
                        className="mt-1 text-[15px] leading-normal text-foreground whitespace-pre-wrap break-words overflow-hidden"
                    >
                        <TweetContent content={tweet.content ?? ''} />
                    </div>

                    {tweet.quotedTweet && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/tweets/${tweet.quotedTweet!.id}`)
                            }}
                            className="quoted-tweet-card"
                        >
                            <div className="quoted-tweet-card-inner">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-semibold text-foreground hover:underline truncate">
                                        {tweet.quotedTweet.username}
                                    </span>
                                    <span className="text-muted-foreground text-sm truncate shrink-0">
                                        @{tweet.quotedTweet.username.toLowerCase()}
                                    </span>
                                </div>
                                <div className="text-[15px] text-foreground whitespace-pre-wrap break-words">
                                    {tweet.quotedTweet.content || ''}
                                </div>
                                {tweet.quotedTweet.imageUrl && (
                                    <div className="quoted-tweet-card-image-wrap">
                                        <Image
                                            src={tweet.quotedTweet.imageUrl}
                                            alt="Quoted tweet"
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="w-full max-h-[280px] object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </button>
                    )}

                    {tweet.imageUrl && (
                        <div className="relative mt-3 rounded-2xl overflow-hidden border border-border">
                            <Image
                                src={tweet.imageUrl}
                                alt="Tweet image"
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    maxHeight: "500px",
                                }}
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between max-w-md mt-3 -ml-2 text-muted-foreground">
                        <Reply
                            tweet={tweet}
                            username={username}
                            repliesCount={tweet.repliesCount}
                        />
                        <RetweetMenu
                            tweet={tweet}
                            username={username}
                            retweetsCount={tweet.retweetsCount}
                            retweeted={tweet.retweeted}
                        />
                        <Like
                            likesCount={tweet.likesCount}
                            liked={tweet.liked}
                            id={tweet.id}
                        />
                        <Bookmark
                            id={tweet.id}
                            bookmarked={tweet.bookmarked ?? false}
                            username={username}
                        />
                        <span title={tweet.createdAt}>{formatRelativeTime(tweet.createdAt)}</span>
                    </div>

                    <CommunityNoteDisplay note={tweet.communityNote} />
                </div>
            </div>
        </article>
    )
}

export default Tweet