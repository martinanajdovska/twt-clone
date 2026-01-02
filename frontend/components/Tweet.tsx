import {ITweetResponse} from "@/dtos/ITweetResponse";
import Image from "next/image";
import "../styles/tweets.css"
import React from "react";
import Like from "../components/Like";
import Retweet from "@/components/Retweet";

const Tweet = ({ id, username, content, imageUrl, likesCount, repliesCount, retweetsCount, liked, retweeted }: ITweetResponse) => {
    // TODO: show replies when user clicks on tweet
    // TODO: handle clicking the button for replying

    function showReplies(){
    }

    return (
        <div id="tweet">
            <div>
                {retweeted?<p>Retweeted</p>:""}
                <div className="tweet-general">
                    <p>{username}</p>
                    <p>{content}</p>
                </div>
                <div>
                    {imageUrl===null?'':<Image src={imageUrl} alt="Tweet image" />}
                </div>
                <div className="tweet-info">
                    <Like likesCount={likesCount} liked={liked} id={id}/>
                    <Retweet retweetsCount={retweetsCount} retweeted={retweeted} id={id}/>

                    <p><button className="rounded" onClick={(e) => {
                        e.preventDefault();
                        reply();
                    }}>Reply</button> {repliesCount}</p>
                </div>
                {/*TODO: call and implement showReplies*/}
                <a>Show replies</a>
            </div>
        </div>
    )
}

export default Tweet