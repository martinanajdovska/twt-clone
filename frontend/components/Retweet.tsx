import React, {useState} from 'react'
import {useMutation} from "@tanstack/react-query";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Retweet = ({retweetsCount, retweeted, id}: { retweetsCount: number, retweeted: boolean, id: bigint }) => {
    const [isRetweetedState, setIsRetweetedState] = useState(retweeted)
    const [retweetsCountState, setRetweetsCountState] = useState(retweetsCount)

    const {mutate: retweetTweet, } = useMutation({
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
                throw new Error(errorData.message || "Error liking tweet");
            }

            return res;
        },
        onSuccess: () => {
            setIsRetweetedState(!isRetweetedState);
            setRetweetsCountState(isRetweetedState ? retweetsCountState - 1 : retweetsCountState + 1);
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    return (
        <p>
            <button className="rounded" onClick={(e) => {
                e.preventDefault();
                retweetTweet();
            }}>{!isRetweetedState ? "Retweet" : "Un-retweet"}</button> {retweetsCountState}
        </p>
    )
}
export default Retweet
