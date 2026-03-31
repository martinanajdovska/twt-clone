'use client'

import { ITweetResponse } from "@/DTO/ITweetResponse"
import Image from "next/image"
import React, { useCallback, useEffect, useState } from "react"
import Like from "./Like"
import Bookmark from "../bookmarks/Bookmark"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Repeat2, Pin as PinIcon, X } from "lucide-react"

import Delete from "@/components/tweets/Delete"
import Reply from "@/components/replies/Reply"
import TweetContent from "@/components/tweets/TweetContent"
import AddCommunityNote from "@/components/community-notes/AddCommunityNote"
import AllCommunityNotesDialog from "@/components/community-notes/AllCommunityNotesDialog"
import CommunityNoteDisplay from "@/components/community-notes/CommunityNoteDisplay"
import RetweetMenu from "@/components/retweets/RetweetMenu"
import TweetDetailStats from "@/components/tweets/TweetDetailStats"
import PinTweet from "@/components/tweets/PinTweet"
import PollDisplay from "@/components/polls/PollDisplay"
import { formatRelativeTime } from "@/lib/relativeTime"
import { TweetDropdownProvider } from "@/contexts/TweetDropdownContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Lightbox from "../ui/LightBox"
import { saveImageFromUrl } from "@/lib/saveImageFromUrl"


function TweetImageWithFallback({
    src,
    fallbackSrc,
    alt,
    className,
}: {
    src: string;
    fallbackSrc?: string | null;
    alt: string;
    className?: string;
}) {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setLoaded(false);
        if (!fallbackSrc || fallbackSrc === src) return;
        const img = new window.Image();
        img.onload = () => setLoaded(true);
        img.onerror = () => setLoaded(false);
        img.src = src;
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, fallbackSrc]);
    const displaySrc = !fallbackSrc || loaded ? src : fallbackSrc;
    return (
        <Image
            src={displaySrc}
            alt={alt}
            width={0}
            height={0}
            sizes="100vw"
            style={{
                width: "auto",
                height: "auto",
            }}
            className={className}
        />
    );
}


const Tweet = ({
    tweet,
    username,
    detailView = false,
    showPinnedLabel = false,
    expandOnClick = true,
}: {
    tweet: ITweetResponse;
    username: string;
    detailView?: boolean;
    showPinnedLabel?: boolean;
    expandOnClick?: boolean;
}) => {
    const router = useRouter()
    const isSelf = username === tweet.username
    const canInteract = username.trim().length > 0
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

    const handleImageClick = (e: React.MouseEvent, url: string) => {
        e.stopPropagation()
        setLightboxSrc(url)
    }
    const handleImageContextMenu = async (e: React.MouseEvent, url: string) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await saveImageFromUrl(url)
        } catch {
            window.open(url, '_blank')
        }
    }

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/users/${tweet.username}`)
    }

    const showTweetInfo = (e: React.MouseEvent) => {
        e.stopPropagation()
        const target = e.target as HTMLElement
        if (target?.closest?.('[data-slot="dialog-overlay"]')) return // dialog background
        const inPortal = target?.closest?.('[data-slot="dialog-portal"]') // dialog window
        const allowNav = target?.closest?.('[data-allow-tweet-nav]') // allow navigation from quotes list
        if (inPortal && !allowNav) return
        if (
            target?.closest?.('[role="dialog"]') &&
            !allowNav
        )
            return
        router.push(`/tweets/${tweet.id}`)
    }

    const [dropdownOpenCount, setDropdownOpenCount] = useState(0)
    const onDropdownOpenChange = useCallback((open: boolean) => {
        setDropdownOpenCount((c) => Math.max(0, c + (open ? 1 : -1)))
    }, [])

    return (
        <TweetDropdownProvider value={{ onOpenChange: onDropdownOpenChange }}>
            <article
                className={`flex flex-col px-4 py-3 hover:bg-white/50 dark:hover:bg-white/[0.03] transition-colors group ${expandOnClick ? "cursor-pointer" : ""}`}
                style={dropdownOpenCount > 0 ? { pointerEvents: 'none' } : undefined}
                onClick={expandOnClick ? showTweetInfo : undefined}
            >
                {showPinnedLabel && tweet.isPinned && (
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
                                    {tweet.displayName}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    @{tweet.username.toLowerCase()}
                                </span>
                            </div>
                            {canInteract ? (
                                <DropdownMenu onOpenChange={onDropdownOpenChange}>
                                    <DropdownMenuTrigger
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button variant="outline" size="icon">
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isSelf && tweet.parentId == null && (
                                            <PinTweet
                                                username={username}
                                                id={tweet.id}
                                                isPinned={tweet.isPinned}
                                            />
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
                            ) : (
                                <div className="pointer-events-none">
                                    <Button variant="outline" size="icon" aria-hidden>
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="mt-1 text-[15px] leading-normal text-foreground whitespace-pre-wrap break-words overflow-hidden">
                            <TweetContent content={tweet.content ?? ''} />
                        </div>

                        {tweet.quotedTweet && (
                            tweet.quotedTweet.isDeleted ? (
                                <div
                                    className="mt-3 w-full px-4 py-3 rounded-2xl border-2 border-border bg-muted/60 dark:bg-[#2f3336] text-left block overflow-hidden cursor-default hover:bg-muted/80 dark:hover:bg-[#3d4144] transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex flex-col gap-2 min-w-0 p-0">
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
                                    className="mt-3 w-full px-4 py-3 rounded-2xl border-2 border-border bg-muted/60 dark:bg-[#2f3336] text-left block overflow-hidden hover:bg-muted/80 dark:hover:bg-[#3d4144] transition-colors"
                                >
                                    <div className="flex flex-col gap-2 min-w-0 p-0">
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
                                            <div className="mt-1 rounded-xl overflow-hidden border border-border">
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
                                        {tweet.quotedTweet.gifUrl && (
                                            <div className="relative mt-3 rounded-2xl overflow-hidden border border-border">
                                                <img
                                                    src={tweet.quotedTweet.gifUrl}
                                                    alt="GIF"
                                                    className="w-full object-cover"
                                                    style={{ height: "280px" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            )
                        )}

                        {tweet.imageUrl && (
                            <div
                                className="relative mt-3 rounded-2xl overflow-hidden cursor-zoom-in"
                                onClick={(e) => handleImageClick(e, tweet.imageUrl!)}
                                onContextMenu={(e) => handleImageContextMenu(e, tweet.imageUrl!)}
                            >
                                <TweetImageWithFallback
                                    src={tweet.imageUrl}
                                    fallbackSrc={tweet.optimisticImageUrl ?? null}
                                    alt="Tweet image"
                                    className="object-contain rounded-2xl w-full max-h-[512px]" />
                            </div>
                        )}
                        {tweet.gifUrl && (
                            <div
                                className="relative mt-3 rounded-2xl overflow-hidden"
                            >
                                <img
                                    src={tweet.gifUrl}
                                    alt="GIF"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="object-contain rounded-2xl"
                                    style={{
                                        width: "auto",
                                        height: "auto",
                                        maxHeight: "500px",
                                    }} />
                            </div>
                        )}

                        {tweet.poll && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <PollDisplay
                                    tweetId={tweet.id}
                                    poll={tweet.poll}
                                    username={username}
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
                            <div className={canInteract ? undefined : "pointer-events-none opacity-50"}>
                                <Reply
                                    tweet={tweet}
                                    username={username}
                                    repliesCount={tweet.repliesCount}
                                    hideCount={detailView}
                                />
                            </div>
                            <div className={canInteract ? undefined : "pointer-events-none opacity-50"}>
                                <RetweetMenu
                                    tweet={tweet}
                                    username={username}
                                    retweetsCount={tweet.retweetsCount}
                                    isRetweeted={tweet.isRetweeted}
                                    hideCount={detailView}
                                />
                            </div>
                            <div className={canInteract ? undefined : "pointer-events-none opacity-50"}>
                                <Like
                                    likesCount={tweet.likesCount}
                                    isLiked={tweet.isLiked}
                                    id={tweet.id}
                                    hideCount={detailView}
                                />
                            </div>
                            <div className={canInteract ? undefined : "pointer-events-none opacity-50"}>
                                <Bookmark
                                    id={tweet.id}
                                    isBookmarked={tweet.isBookmarked}
                                    username={username}
                                />
                            </div>
                            <span title={tweet.createdAt}>{formatRelativeTime(tweet.createdAt)}</span>
                        </div>

                        <CommunityNoteDisplay note={tweet.communityNote} />
                    </div>
                </div>
            </article>
            {lightboxSrc && (
                <Lightbox
                    src={lightboxSrc}
                    onClose={() => setLightboxSrc(null)}
                />
            )}
        </TweetDropdownProvider>
    )
}

export default Tweet