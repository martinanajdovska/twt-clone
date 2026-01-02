import {useMutation} from "@tanstack/react-query";
import React, {useState} from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Like = ({likesCount, liked, id}: { likesCount: number, liked: boolean, id: bigint }) => {
    const [isLikedState, setIsLikedState] = useState(liked)
    const [likesCountState, setLikesCountState] = useState(likesCount)

    const {mutate: likeTweet} = useMutation({
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
            setLikesCountState(isLikedState ? likesCountState - 1 : likesCountState + 1);
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });


    return (
        <p>
            <button className="rounded" onClick={(e) => {
                e.preventDefault();
                likeTweet();
            }}>{!isLikedState ? "Like" : "Unlike"}</button> {likesCountState}
        </p>
    )
}
export default Like
