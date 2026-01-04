'use client'
import React, {useState} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const TweetForm = ({username, parentId, onSuccess}:{username:string, parentId?:number, onSuccess?: ()=>void}) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const { mutate: createTweet, isPending } = useMutation({
        mutationFn: async (content:string ) => {
            const response = await fetch(`${BASE_URL}/api/tweets`, {
                method: "POST",
                body: JSON.stringify({content: content, parentId: parentId}),
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
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            queryClient.invalidateQueries({ queryKey: ['tweet', parentId?.toString()] });

            if (onSuccess) onSuccess();
        },
        onError: (err) => {
            console.error("Connection error:", err);
            alert("Could not create tweet. Please try again.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        createTweet(content);
    }

    return (
        <div className="p-4 bg-card border-b border-border">
            <div className="flex gap-3">
                {/*TODO: profile picture*/}
                <div className="h-10 w-10 rounded-full bg-accent flex-shrink-0" />

                <form onSubmit={handleSubmit} className="flex-1 group">
                    <textarea
                        name="content"
                        placeholder="What's happening?!"
                        value={content}
                        rows={content.split('\n').length > 3 ? 5 : 2}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPending}
                        className="w-full bg-transparent border-none text-xl placeholder:text-muted-foreground focus:ring-0 resize-none outline-none py-2 min-h-[50px]"
                    />

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                        <div className="flex items-center gap-1 text-primary">
                            {/*TODO: upload image*/}
                            <button type="button" className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                                <ImageIcon size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {content.length > 0 && (
                                <span className={`text-xs ${content.length > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {content.length}/280
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isPending || !content.trim() || content.length > 280}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : 'Tweet'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TweetForm