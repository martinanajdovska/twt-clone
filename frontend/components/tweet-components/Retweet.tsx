'use client'
import React, {useState} from 'react'
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { Repeat2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Retweet = ({retweetsCount, retweeted, id, username}: { retweetsCount: number, retweeted: boolean, id: number, username:string }) => {
    const queryClient = useQueryClient();

    const [isRetweetedState, setIsRetweetedState] = useState(retweeted)
    const [retweetsCountState, setRetweetsCountState] = useState(retweetsCount)

    const {mutate: handleRetweet, isPending} = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}/retweets`, {
                method: `${isRetweetedState ? "DELETE" : "POST"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Error retweeting tweet");
            }

            return res;
        },
        onSuccess: () => {
            setIsRetweetedState(!isRetweetedState);
            setRetweetsCountState(prev => (isRetweetedState ? prev - 1 : prev + 1));
            queryClient.invalidateQueries({queryKey: ['profile', username]});
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
                    handleRetweet();
                }}
                className={`
                    p-2 rounded-full transition-all duration-200
                    ${isRetweetedState
                    ? "text-emerald-500 bg-emerald-500/10"
                    : "text-muted-foreground group-hover:text-emerald-500 group-hover:bg-emerald-500/10"}
                    ${isPending ? "opacity-50" : "active:scale-90"}
                `}
                aria-label={isRetweetedState ? "Undo Retweet" : "Retweet"}
            >
                <Repeat2
                    size={18}
                    className={`transition-transform duration-300 ${
                        isRetweetedState ? "rotate-180" : "rotate-0"
                    } ${isPending ? "animate-pulse" : ""}`}
                    fill = {isRetweetedState ? "green" : "none"}
                />
            </button>

            <span className={`text-sm font-medium transition-colors ${
                isRetweetedState ? "text-emerald-500" : "text-muted-foreground group-hover:text-emerald-500"
            }`}>
                {retweetsCountState}
            </span>
        </div>
    )
}
export default Retweet
