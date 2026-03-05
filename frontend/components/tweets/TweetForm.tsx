'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, User, X } from 'lucide-react'

const MAX_TWEET_LENGTH = 280
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'

import { useCreateTweet } from '@/hooks/tweets/useCreateTweet'
import { getMentionTrigger } from '@/hooks/tweets/useMentionSuggestions'
import { fetchUsers } from '@/api-calls/users-api'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const TweetForm = ({ username, parentId, quoteId, onSuccess, profilePicture }: { username: string; parentId?: number; quoteId?: number; onSuccess?: () => void; profilePicture?: string }) => {
    const [content, setContent] = useState('')
    const [cursorPosition, setCursorPosition] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const formContainerRef = useRef<HTMLDivElement>(null)
    const { mutate: createTweet, isPending } = useCreateTweet({ username, parentId })

    const mentionTrigger = getMentionTrigger(content, cursorPosition)
    const mentionQuery = mentionTrigger?.query ?? ''
    const [debouncedMentionQuery] = useDebounce(mentionQuery, 300)

    const { data: mentionUsers = [], isLoading: mentionLoading } = useQuery({
        queryKey: ['mention-search', debouncedMentionQuery],
        queryFn: () => fetchUsers(debouncedMentionQuery),
        enabled: mentionTrigger !== null,
    })

    const showMentionDropdown = mentionTrigger !== null
    const displayMentionUsers = mentionQuery.length > 0 ? mentionUsers : []

    useEffect(() => {
        setMentionHighlightIndex(0)
    }, [displayMentionUsers.length])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (formContainerRef.current && !formContainerRef.current.contains(e.target as Node)) {
                setMentionHighlightIndex(0)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const insertMention = (selectedUsername: string) => {
        if (!mentionTrigger || !textareaRef.current) return
        const { atIndex } = mentionTrigger
        const before = content.slice(0, atIndex)
        const after = content.slice(cursorPosition)
        const newContent = `${before}@${selectedUsername} ${after}`
        setContent(newContent)
        const newCursor = atIndex + selectedUsername.length + 2 // '@' + username + ' '
        requestAnimationFrame(() => {
            textareaRef.current?.focus()
            textareaRef.current?.setSelectionRange(newCursor, newCursor)
        })
        setMentionHighlightIndex(0)
    }

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
        e.preventDefault()
        if (!content.trim() && !selectedFile) return

        const formData = new FormData()
        formData.append('content', content)
        if (parentId) formData.append('parentId', parentId.toString())
        if (quoteId) formData.append('quoteId', quoteId.toString())
        if (selectedFile) formData.append('image', selectedFile)

        createTweet(formData, {
            onSuccess: () => {
                setContent('')
                removeImage()
                if (onSuccess) onSuccess()
            },
        })
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.slice(0, MAX_TWEET_LENGTH)
        setContent(value)
        setCursorPosition(Math.min(e.target.selectionStart ?? 0, value.length))
    }

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMentionDropdown || displayMentionUsers.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setMentionHighlightIndex((i) => Math.min(i + 1, displayMentionUsers.length - 1))
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setMentionHighlightIndex((i) => Math.max(i - 1, 0))
            return
        }
        if (e.key === 'Enter' && displayMentionUsers.length > 0) {
            e.preventDefault()
            insertMention(displayMentionUsers[mentionHighlightIndex])
            return
        }
        if (e.key === 'Escape') {
            setMentionHighlightIndex(0)
        }
    }

    return (
        <div ref={formContainerRef} className="p-4 bg-card border-b border-border shadow-sm">
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-accent flex items-center justify-center font-bold text-sm">
                            {username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 group relative">
                    <textarea
                        ref={textareaRef}
                        name="content"
                        placeholder="What's happening?!"
                        value={content}
                        maxLength={MAX_TWEET_LENGTH}
                        rows={content.split('\n').length > 3 ? 5 : 2}
                        onChange={handleTextareaChange}
                        onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                        onKeyDown={handleTextareaKeyDown}
                        onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                        onClick={() => setCursorPosition(textareaRef.current?.selectionStart ?? 0)}
                        disabled={isPending}
                        className="w-full bg-transparent border-none text-xl placeholder:text-muted-foreground focus:ring-0 resize-none outline-none py-2 min-h-[50px]"
                    />

                    {showMentionDropdown && (
                        <div className="absolute left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                            {mentionQuery.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-muted-foreground">
                                    Type to search users
                                </div>
                            ) : mentionLoading ? (
                                <div className="px-4 py-4 flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : displayMentionUsers.length > 0 ? (
                                <div className="flex flex-col py-1">
                                    {displayMentionUsers.map((u: string, i: number) => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => insertMention(u)}
                                            className={`px-4 py-3 flex items-center gap-3 transition-colors text-left ${i === mentionHighlightIndex ? '!bg-primary/15 ring-inset ring-2 ring-primary/40' : 'hover:bg-muted'}`}
                                        >
                                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                <User size={18} className="text-muted-foreground" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground">@{u}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-3 text-sm text-muted-foreground">
                                    No users found for &quot;{mentionQuery}&quot;
                                </div>
                            )}
                        </div>
                    )}

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
                            {content.length > 0 && (
                                <span
                                    className={`text-sm tabular-nums ${
                                        content.length > MAX_TWEET_LENGTH
                                            ? 'text-destructive font-bold'
                                            : content.length >= MAX_TWEET_LENGTH - 20
                                              ? 'text-amber-500'
                                              : 'text-muted-foreground'
                                    }`}
                                >
                                    {content.length}/{MAX_TWEET_LENGTH}
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isPending || content.length > MAX_TWEET_LENGTH || (!content.trim() && !selectedFile)}
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