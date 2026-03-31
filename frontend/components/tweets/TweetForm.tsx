'use client'
import React, { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useCreateTweet } from '@/hooks/tweets/useCreateTweet'
import { fetchUsers } from '@/api-calls/users-api'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import PollForm from '../polls/PollForm'
import MentionDropdown from './MentionDropdown'
import TweetFormToolbar from './TweetFormToolbar'
import GifPicker from '@/components/GifPicker'

const MAX_TWEET_LENGTH = 280

export function pollDurationToMinutes(minutes: number, hours: number, days: number): number {
    const total = days * 24 * 60 + hours * 60 + minutes
    return total < 1 ? 1 : total
}

export function getMentionTrigger(
    text: string,
    cursorPosition: number,
): { query: string; atIndex: number } | null {
    const before = text.slice(0, cursorPosition);
    const match = before.match(/@(\w*)$/);
    if (!match) return null;
    const atIndex = before.length - match[0].length;
    return { query: match[1], atIndex };
}

const TweetForm = ({ username, parentId, quoteId, onSuccess, profilePicture }: {
    username: string; parentId?: number; quoteId?: number; onSuccess?: () => void; profilePicture?: string
}) => {
    const [content, setContent] = useState('')
    const [cursorPosition, setCursorPosition] = useState(0)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
    const [gifUrl, setGifUrl] = useState<string | null>(null)
    const [gifPickerOpen, setGifPickerOpen] = useState(false)
    const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
    const [showPoll, setShowPoll] = useState(false)
    const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
    const [pollDurationMinutes, setPollDurationMinutes] = useState(0)
    const [pollDurationHours, setPollDurationHours] = useState(0)
    const [pollDurationDays, setPollDurationDays] = useState(1)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { mutate: createTweet } = useCreateTweet({
        username,
        parentId,
        quoteId,
        profilePictureUrl: profilePicture ?? null,
    })

    const mentionTrigger = getMentionTrigger(content, cursorPosition)
    const mentionQuery = mentionTrigger?.query ?? ''
    const [debouncedMentionQuery] = useDebounce(mentionQuery, 300)
    const { data: mentionUsers = [], isLoading: mentionLoading } = useQuery({
        queryKey: ['mention-search', debouncedMentionQuery],
        queryFn: () => fetchUsers(debouncedMentionQuery),
        enabled: mentionTrigger !== null,
    })
    const displayMentionUsers = mentionQuery.length > 0 ? mentionUsers : []

    const canAddPoll = parentId == null && quoteId == null
    const validPollOptions = pollOptions.map(o => o.trim()).filter(Boolean)
    const hasEnoughPollOptions = validPollOptions.length >= 2
    const canSubmit: boolean = (content.trim().length > 0 || !!selectedImageFile || !!selectedVideoFile || !!gifUrl || (showPoll && hasEnoughPollOptions)) && content.length <= MAX_TWEET_LENGTH

    const removeImage = () => {
        setSelectedImageFile(null)
        setImagePreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }
    const removeVideo = () => {
        setSelectedVideoFile(null)
        setVideoPreviewUrl(null)
        if (videoInputRef.current) videoInputRef.current.value = ''
    }
    const removeGif = () => setGifUrl(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return

        const formData = new FormData()
        formData.append('content', content)
        if (parentId) formData.append('parentId', parentId.toString())
        if (quoteId) formData.append('quoteId', quoteId.toString())
        if (selectedImageFile) formData.append('image', selectedImageFile)
        if (selectedVideoFile) formData.append('video', selectedVideoFile)
        if (gifUrl) formData.append('gifUrl', gifUrl)
        if (showPoll && hasEnoughPollOptions && canAddPoll) {
            formData.append('pollOptions', JSON.stringify(validPollOptions))
            formData.append('pollDurationMinutes', String(pollDurationToMinutes(pollDurationMinutes, pollDurationHours, pollDurationDays)))
        }
        createTweet(formData, { onSuccess: () => onSuccess?.() })
        setContent('')
        removeImage()
        removeVideo()
        removeGif()
        setShowPoll(false)
        setPollOptions(['', ''])
        setPollDurationMinutes(0)
        setPollDurationHours(0)
        setPollDurationDays(1)
    }

    const handleTextareaKeyDown = useKeyboardNavigation({
        items: displayMentionUsers,
        highlightedIndex: mentionHighlightIndex,
        setHighlightedIndex: setMentionHighlightIndex,
        isOpen: mentionTrigger !== null,
        onSelect: (i) => {
            if (!mentionTrigger || !textareaRef.current) return

            const before = content.slice(0, mentionTrigger.atIndex)
            const after = content.slice(cursorPosition)
            const newContent = `${before}@${displayMentionUsers[i]} ${after}`
            setContent(newContent)

            const newCursor = mentionTrigger.atIndex + displayMentionUsers[i].length + 2
            requestAnimationFrame(() => {
                textareaRef.current?.focus()
                textareaRef.current?.setSelectionRange(newCursor, newCursor)
            })
            setMentionHighlightIndex(0)
        },
    })

    return (
        <div className="p-4 bg-background">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={profilePicture} className="object-cover" />
                    <AvatarFallback className="bg-accent font-bold text-sm">{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <form onSubmit={handleSubmit} className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        placeholder="What's happening?!"
                        value={content}
                        maxLength={MAX_TWEET_LENGTH}
                        rows={content.split('\n').length > 3 ? 5 : 2}
                        onChange={(e) => { setContent(e.target.value.slice(0, MAX_TWEET_LENGTH)); setCursorPosition(e.target.selectionStart ?? 0) }}
                        onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && mentionTrigger === null) {
                                e.preventDefault()
                                if (canSubmit) handleSubmit(e as any)
                                return
                            }
                            handleTextareaKeyDown(e)
                        }} onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                        onClick={() => setCursorPosition(textareaRef.current?.selectionStart ?? 0)}
                        className="w-full bg-transparent border-none text-xl placeholder:text-muted-foreground focus:ring-0 resize-none outline-none py-2 min-h-[50px]"
                    />

                    {mentionTrigger !== null && (
                        <MentionDropdown
                            users={displayMentionUsers}
                            highlightedIndex={mentionHighlightIndex}
                            isLoading={mentionLoading}
                            mentionQuery={mentionQuery}
                            onSelect={(u) => {
                                const i = displayMentionUsers.indexOf(u)
                                if (i !== -1) handleTextareaKeyDown({ key: 'Enter', preventDefault: () => { } } as any)
                            }}
                        />
                    )}

                    {imagePreviewUrl && (
                        <div className="relative mt-2 mb-4">
                            <Image src={imagePreviewUrl} width={300} height={300} className="rounded-2xl max-h-80 w-full object-cover border" alt="Preview" />
                            <button type="button" onClick={removeImage} className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-white">
                                <X size={18} />
                            </button>
                        </div>
                    )}
                    {videoPreviewUrl && (
                        <div className="relative mt-2 mb-4">
                            <video
                                src={videoPreviewUrl}
                                controls
                                playsInline
                                className="rounded-2xl max-h-80 w-full object-contain border bg-black"
                            />
                            <button type="button" onClick={removeVideo} className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-white">
                                <X size={18} />
                            </button>
                        </div>
                    )}
                    {gifUrl && (
                        <div className="relative mt-2 mb-4">
                            <Image src={gifUrl} width={300} height={200} className="rounded-2xl max-h-80 w-full object-cover border" alt="GIF" unoptimized />
                            <button type="button" onClick={removeGif} className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-white">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {showPoll && canAddPoll && (
                        <PollForm
                            pollOptions={pollOptions}
                            pollDurationMinutes={pollDurationMinutes}
                            pollDurationHours={pollDurationHours}
                            pollDurationDays={pollDurationDays}
                            onOptionChange={(i, v) => setPollOptions(prev => { const next = [...prev]; next[i] = v.slice(0, 25); return next })}
                            onAddOption={() => setPollOptions(prev => [...prev, ''])}
                            onRemoveOption={(i) => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                            onMinutesChange={setPollDurationMinutes}
                            onHoursChange={setPollDurationHours}
                            onDaysChange={setPollDurationDays}
                        />
                    )}

                    <TweetFormToolbar
                        content={content}
                        isPending={false}
                        canSubmit={canSubmit}
                        canAddPoll={canAddPoll}
                        showPoll={showPoll}
                        hasGif={!!gifUrl}
                        onTogglePoll={() => setShowPoll(p => !p)}
                        onFileClick={() => fileInputRef.current?.click()}
                        onVideoClick={() => videoInputRef.current?.click()}
                        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                        videoInputRef={videoInputRef as React.RefObject<HTMLInputElement>}
                        onFileChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                setGifUrl(null)
                                removeVideo()
                                setSelectedImageFile(file)
                                setImagePreviewUrl(URL.createObjectURL(file))
                            }
                        }}
                        onVideoChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                setGifUrl(null)
                                removeImage()
                                setSelectedVideoFile(file)
                                setVideoPreviewUrl(URL.createObjectURL(file))
                            }
                        }}
                        onGifClick={() => setGifPickerOpen(true)}
                    />
                </form>
                <GifPicker
                    open={gifPickerOpen}
                    onClose={() => setGifPickerOpen(false)}
                    onSelect={(url) => {
                        removeImage()
                        removeVideo()
                        setGifUrl(url)
                        setGifPickerOpen(false)
                    }}
                />
            </div>
        </div>
    )
}

export default TweetForm