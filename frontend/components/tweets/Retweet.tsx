'use client'
import React, {useState} from 'react'
import { Repeat2 } from "lucide-react";
import {useRetweet} from "@/hooks/tweets/useRetweet";

const Retweet = ({retweetsCount, retweeted, id, username}: { retweetsCount: number, retweeted: boolean, id: number, username:string }) => {
    const [isRetweetedState, setIsRetweetedState] = useState(retweeted)
    const [retweetsCountState, setRetweetsCountState] = useState(retweetsCount)

    const { mutate: handleRetweet, isPending } = useRetweet(username);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const newLikedState = !isRetweetedState;
        setIsRetweetedState(newLikedState);
        setRetweetsCountState(prev => newLikedState ? prev + 1 : prev - 1);

        handleRetweet({id, isRetweeted:isRetweetedState}, {
            onError: (err) => {
                // rollback if it fails on the server
                setIsRetweetedState(!newLikedState);
                setRetweetsCountState(prev => !newLikedState ? prev + 1 : prev - 1);
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
