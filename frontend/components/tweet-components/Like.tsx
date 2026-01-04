'use client'
import {useMutation} from "@tanstack/react-query";
import React, {useState} from 'react'
import { Heart } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Like = ({likesCount, liked, id}: { likesCount: number, liked: boolean, id: number }) => {
    const [isLikedState, setIsLikedState] = useState(liked)
    const [likesCountState, setLikesCountState] = useState(likesCount)

    const {mutate: handleLike, isPending} = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}/likes`, {
                method: `${isLikedState ? "DELETE" : "POST"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Error liking tweet");
            }

            return res;
        },
        onSuccess: () => {
            setIsLikedState(!isLikedState);
            setLikesCountState(prev => (isLikedState ? prev - 1 : prev + 1));
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    return (
        <div className="flex items-center gap-1 group">
            <button
                disabled={isPending}
                onClick={(e) => {
                    e.preventDefault();
                    handleLike();
                }}
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

            <span className={`text-sm font-medium transition-colors ${
                isLikedState ? "text-pink-600" : "text-muted-foreground group-hover:text-pink-600"
            }`}>
                {likesCountState}
            </span>
        </div>
    );
}
export default Like
