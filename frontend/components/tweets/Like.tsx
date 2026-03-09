'use client'
import React, { useState } from 'react'
import { Heart } from "lucide-react";
import { useLikeTweet } from "@/hooks/tweets/useLikeTweet";

const Like = ({ likesCount, isLiked, id, hideCount = false }: { likesCount: number, isLiked: boolean, id: number, hideCount: boolean }) => {
    const [isLikedState, setIsLikedState] = useState(isLiked)
    const [likesCountState, setLikesCountState] = useState(likesCount)

    const { mutate: handleLike, isPending } = useLikeTweet();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newLikedState = !isLikedState;
        setIsLikedState(newLikedState);
        setLikesCountState(prev => newLikedState ? prev + 1 : prev - 1);

        handleLike({ id, isLiked: isLikedState }, {
            onError: (err) => {
                // rollback if it fails on the server
                setIsLikedState(!newLikedState);
                setLikesCountState(prev => !newLikedState ? prev + 1 : prev - 1);
                alert(err.message);
            }
        });
    };

    return (
        <div className="flex items-center gap-1 group">
            <button
                disabled={isPending}
                onClick={handleClick}
                className={`
                    p-2 rounded-full transition-all duration-200
                    ${isLikedState
                        ? "text-pink-600 bg-pink-600/10"
                        : "text-muted-foreground group-hover:text-pink-600 group-hover:bg-pink-600/10"}
                    ${isPending ? "opacity-50" : "active:scale-90"}
                `}
                aria-label={isLikedState ? "Unlike" : "Like"}
            >
                <Heart
                    size={18}
                    fill={isLikedState ? "red" : "none"}
                    className={isLikedState ? "animate-in zoom-in duration-300" : ""}
                />
            </button>

            {!hideCount && (
                <span className={`text-sm font-medium transition-colors ${isLikedState ? "text-pink-600" : "text-muted-foreground group-hover:text-pink-600"
                    }`}>
                    {likesCountState}
                </span>
            )}
        </div>
    );
}
export default Like
