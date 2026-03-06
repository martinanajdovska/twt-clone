'use client'

import { ITweetResponse } from "@/DTO/ITweetResponse"
import Image from "next/image"
import React from "react"
import Like from "./Like"
import Bookmark from "./Bookmark"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Repeat2, Pin as PinIcon } from "lucide-react"

import Delete from "@/components/tweets/Delete"
import Reply from "@/components/tweets/Reply"
import TweetContent from "@/components/tweets/TweetContent"
import AddCommunityNote from "@/components/community-notes/AddCommunityNote"
import AllCommunityNotesDialog from "@/components/community-notes/AllCommunityNotesDialog"
import CommunityNoteDisplay from "@/components/community-notes/CommunityNoteDisplay"
import RetweetMenu from "@/components/tweets/RetweetMenu"
import TweetDetailStats from "@/components/tweets/TweetDetailStats"
import PinTweet from "@/components/tweets/PinTweet"
import { formatRelativeTime } from "@/lib/relativeTime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Tweet = ({
    tweet,
    username,
    detailView = false,
}: {
    tweet: ITweetResponse;
    username: string;
    detailView?: boolean;
}) => {
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
            {tweet.isPinned && (
                <div className="flex items-center gap-2 ml-8 mb-1 text-muted-foreground">
                    <PinIcon size={14} className="font-bold" />
                    <span className="text-[13px] font-bold">Pinned</span>
                </div>
            )}
            {(tweet.isRetweeted || tweet.retweetedBy) && (
                <div className="flex items-center gap-2 ml-8 mb-1 text-muted-foreground">
                    <Repeat2 size={14} className="font-bold" />
                    <span className="text-[13px] font-bold hover:underline">
                        {tweet.isRetweeted ? "You" : tweet.retweetedBy} retweeted
                    </span>
                </div>
            )}

            <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10" onClick={handleUserClick}>
                    <Avatar className="h-full w-full">
                        <AvatarImage src={tweet.profilePictureUrl ?? undefined} className="object-cover" />
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
                                {isSelf && tweet.parentId == null && (
                                    <PinTweet username={username} id={tweet.id} isPinned={tweet.isPinned} />
                                )}
                                <AddCommunityNote tweetId={tweet.id} />
                                <AllCommunityNotesDialog tweetId={tweet.id} />
                                {isSelf && (
                                    <Delete
                                        username={username}
                                        id={tweet.id}
                                        parentId={tweet.parentId ?? undefined}
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
                        tweet.quotedTweet.isDeleted ? (
                            <div
                                className="quoted-tweet-card cursor-default"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="quoted-tweet-card-inner">
                                    <div className="text-[15px] text-muted-foreground italic py-2">
                                        This tweet was deleted
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                        )
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

                    {detailView && (
                        <TweetDetailStats
                            tweetId={tweet.id}
                            likesCount={tweet.likesCount}
                            retweetsCount={tweet.retweetsCount}
                            quotesCount={tweet.quotesCount ?? 0}
                            bookmarksCount={tweet.bookmarksCount ?? 0}
                            username={username}
                        />
                    )}

                    <div className="flex items-center justify-between max-w-md mt-3 -ml-2 text-muted-foreground">
                        <Reply
                            tweet={tweet}
                            username={username}
                            repliesCount={tweet.repliesCount}
                            hideCount={detailView}
                        />
                        <RetweetMenu
                            tweet={tweet}
                            username={username}
                            retweetsCount={tweet.retweetsCount}
                            isRetweeted={tweet.isRetweeted}
                            hideCount={detailView}
                        />
                        <Like
                            likesCount={tweet.likesCount}
                            isLiked={tweet.isLiked}
                            id={tweet.id}
                            hideCount={detailView}
                        />
                        <Bookmark
                            id={tweet.id}
                            isBookmarked={tweet.isBookmarked}
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