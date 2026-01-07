'use client'
import React, {useState} from 'react'
import { Image as ImageIcon } from 'lucide-react'

import {useCreateTweet} from "@/hooks/tweets/useCreateTweet";

const TweetForm = ({username, parentId, onSuccess}:{username:string, parentId?:number, onSuccess?: ()=>void}) => {
    const [content, setContent] = useState("");

    const { mutate: createTweet, isPending } = useCreateTweet({username, parentId});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        createTweet({content, parentId}, {
            onSuccess: () => {
                setContent("");
                if (onSuccess) onSuccess();
            }
        });
    }

    return (
        <div className="p-4 bg-card border-b border-border shadow-sm">
            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div
                        className="h-10 w-10 rounded-full bg-accent flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-sm"
                    >
                        {/*TODO: show profile picture instead*/}
                        {username.charAt(0).toUpperCase()}
                    </div>
                </div>

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