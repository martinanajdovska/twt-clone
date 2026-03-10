'use client'
import React, { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useCreateTweet } from '@/hooks/tweets/useCreateTweet'
import { getMentionTrigger } from '@/hooks/tweets/useMentionSuggestions'
import { fetchUsers } from '@/api-calls/users-api'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import PollForm from '../polls/PollForm'
import MentionDropdown from './MentionDropdown'
import TweetFormToolbar from './TweetFormToolbar'

const MAX_TWEET_LENGTH = 280

const TweetForm = ({ username, parentId, quoteId, onSuccess, profilePicture }: {
    username: string; parentId?: number; quoteId?: number; onSuccess?: () => void; profilePicture?: string
}) => {
    const [content, setContent] = useState('')
    const [cursorPosition, setCursorPosition] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
    const [showPoll, setShowPoll] = useState(false)
    const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
    const [pollDurationHours, setPollDurationHours] = useState(24)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { mutate: createTweet, isPending } = useCreateTweet({ username, parentId, quoteId })

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
    const canSubmit = (content.trim().length > 0 || selectedFile || (showPoll && hasEnoughPollOptions)) && content.length <= MAX_TWEET_LENGTH

    const removeImage = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        const formData = new FormData()
        formData.append('content', content)
        if (parentId) formData.append('parentId', parentId.toString())
        if (quoteId) formData.append('quoteId', quoteId.toString())
        if (selectedFile) formData.append('image', selectedFile)
        if (showPoll && hasEnoughPollOptions && canAddPoll) {
            formData.append('pollOptions', JSON.stringify(validPollOptions))
            formData.append('pollDurationHours', pollDurationHours.toString())
        }
        createTweet(formData, {
            onSuccess: () => {
                setContent('')
                removeImage()
                setShowPoll(false)
                setPollOptions(['', ''])
                setPollDurationHours(24)
                onSuccess?.()
            }
        })
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
                                if (canSubmit && !isPending) handleSubmit(e as any)
                                return
                            }
                            handleTextareaKeyDown(e)
                        }} onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                        onClick={() => setCursorPosition(textareaRef.current?.selectionStart ?? 0)}
                        disabled={isPending}
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

                    {previewUrl && (
                        <div className="relative mt-2 mb-4">
                            <Image src={previewUrl} width={300} height={300} className="rounded-2xl max-h-80 w-full object-cover border" alt="Preview" />
                            <button type="button" onClick={removeImage} className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-white">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {showPoll && canAddPoll && (
                        <PollForm
                            pollOptions={pollOptions}
                            pollDurationHours={pollDurationHours}
                            onOptionChange={(i, v) => setPollOptions(prev => { const next = [...prev]; next[i] = v.slice(0, 25); return next })}
                            onAddOption={() => setPollOptions(prev => [...prev, ''])}
                            onRemoveOption={(i) => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                            onDurationChange={setPollDurationHours}
                        />
                    )}

                    <TweetFormToolbar
                        content={content}
                        isPending={isPending}
                        canSubmit={canSubmit}
                        canAddPoll={canAddPoll}
                        showPoll={showPoll}
                        onTogglePoll={() => setShowPoll(p => !p)}
                        onFileClick={() => fileInputRef.current?.click()}
                        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                        onFileChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)) }
                        }}
                    />
                </form>
            </div>
        </div>
    )
}

export default TweetForm