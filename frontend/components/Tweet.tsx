import Link from "next/link";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Image from "next/image";
import "../styles/tweets.css"
import {useMutation} from "@tanstack/react-query";
import React from "react";

const Tweet = ({ id, username, parentId, content, imageUrl, replies, likesCount, repliesCount, retweetsCount }: ITweetResponse) => {
    // TODO: show replies when user clicks on tweet
    // TODO: handle clicking the buttons for liking retweeting and replying

    return (
        <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/tweets/${id}`} id="tweet">
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
                    }}>Like</button> {likesCount}</p>
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
        </Link>
    )
}

export default Tweet