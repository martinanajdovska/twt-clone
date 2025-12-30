import Link from "next/link";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Image from "next/image";
import "../styles/tweets.css"

const Tweet = async ({ id, username, parentId, content, imageUrl, replies, likesCount, repliesCount, retweetsCount }: ITweetResponse) => {
    // TODO: show replies when user clicks on tweet
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
                    <p>Likes: {likesCount}</p>
                    <p>Retweets: {retweetsCount}</p>
                    <p>Replies: {repliesCount}</p>
                </div>
            </div>
        </Link>
    )
}

export default Tweet