'use client'
import React, {useRef, useState} from 'react'
import {ImageIcon, X} from 'lucide-react'

import {useCreateTweet} from "@/hooks/tweets/useCreateTweet";
import Image from "next/image";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const TweetForm = ({username, parentId, onSuccess, profilePicture}:{username:string, parentId?:number, onSuccess?: ()=>void, profilePicture:string}) => {
    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutate: createTweet, isPending } = useCreateTweet({ username, parentId });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;

        const formData = new FormData();
        formData.append("content", content);
        if (parentId) formData.append("parentId", parentId.toString());
        if (selectedFile) formData.append("image", selectedFile);

        createTweet(formData, {
            onSuccess: () => {
                setContent("");
                removeImage();
                if (onSuccess) onSuccess();
            }
        });
    }

    return (
        <div className="p-4 bg-card border-b border-border shadow-sm">
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-accent flex items-center justify-center font-bold text-sm">
                            {username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
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

                    {previewUrl && (
                        <div className="relative mt-2 mb-4 group">
                            <Image src={previewUrl}
                                   width={300}
                                   height={300}
                                   className="rounded-2xl max-h-80 w-full object-cover border"
                                   alt="Preview" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-primary">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-primary/10 rounded-full transition-colors hover:cursor-pointer"
                            >
                                <ImageIcon size={20} />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                name="image"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isPending || (!content.trim() && !selectedFile)}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-50"
                            >
                                {isPending ? "Sending..." : "Tweet"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TweetForm