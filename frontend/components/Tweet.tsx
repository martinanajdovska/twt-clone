import Link from "next/link";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Image from "next/image";
import "../styles/tweets.css"
import {useMutation} from "@tanstack/react-query";
import React, {useState} from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Tweet = ({ id, username, parentId, content, imageUrl, replies, likesCount, repliesCount, retweetsCount }: ITweetResponse) => {
    // TODO: show replies when user clicks on tweet
    // TODO: handle clicking the buttons for liking retweeting and replying

    // TODO: check if user has already liked/retweeted tweet before
    const [liked, setLiked] = useState(false)

    const { mutate: likeTweet, isPending } = useMutation({
        mutationFn: async (credentials) => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}/likes`, {
                method: `${liked?"DELETE":"POST"}`,
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
            setLiked(!liked);
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    function tweetInfo(){
        //TODO: expand tweet and show replies
    }

    return (
        // TODO: change element
        <a onClick={tweetInfo} id="tweet">
            <div>
                <div className="tweet-general">
                    <p>{username}</p>
                    <p>{content}</p>
                </div>
                <div>
                    {imageUrl===null?'':<Image src={imageUrl} alt="Tweet image" />}

                </div>
                <div className="tweet-info">
                    <p><button className="rounded" onClick={(e) => {
                        e.preventDefault();
                        likeTweet();
                    }}>{!liked?"Like":"Unlike"}</button> {likesCount}</p>

                    <p><button className="rounded" onClick={(e) => {
                        e.preventDefault();
                        retweet();
                    }}>Retweet</button> {retweetsCount}</p>

                    <p><button className="rounded" onClick={(e) => {
                        e.preventDefault();
                        reply();
                    }}>Reply</button> {repliesCount}</p>
                </div>
            </div>
        </a>
    )
}

export default Tweet