'use client'
import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const TweetForm = ({token}:{token:string}) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const { mutate: createTweet, isPending } = useMutation({
        mutationFn: async (newTweet: { content: string }) => {
            const response = await fetch(`${BASE_URL}/api/tweets`, {
                method: "POST",
                body: JSON.stringify(newTweet),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Error creating tweet");
            }
            return response;
        },
        onSuccess: () => {
            setContent("");

            queryClient.invalidateQueries({ queryKey: ['tweets', token] });
        },
        onError: (err) => {
            console.error("Connection error:", err);
            alert("Could not create tweet. Please try again.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        createTweet({ content });
    }

    return (
        <div className="mb-3">
            <form onSubmit={handleSubmit}>
                <textarea
                    name="content"
                    placeholder="Share your thoughts..."
                    value={content}
                    cols={40}
                    rows={5}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isPending}
                    className="border p-2 rounded w-full"
                />
                <button
                    className="ms-3 rounded px-4 py-2 bg-blue-500 text-black disabled:bg-gray-400"
                    type="submit"
                    disabled={isPending || !content.trim()}
                >
                    {isPending ? 'Tweeting...' : 'Tweet'}
                </button>
            </form>
        </div>
    )
}

export default TweetForm