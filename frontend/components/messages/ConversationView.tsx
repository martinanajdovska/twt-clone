'use client'

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { Send, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useGetMessages } from '@/hooks/messages/useGetMessages'
import { useSendMessage } from '@/hooks/messages/useSendMessage'
import MessageBubble from './MessageBubble'
import GifPicker from '@/components/GifPicker'
import { useCallback } from 'react'

const STICKY_BOTTOM_THRESHOLD = 80

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={22} />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Full preview"
          className="rounded-xl object-contain max-w-[90vw] max-h-[90vh] shadow-2xl"
        />
      </div>
    </div>
  )
}

export default function ConversationView({
  conversationId,
  otherParticipant,
}: {
  conversationId: number
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
}) {
  const [input, setInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [gifPickerOpen, setGifPickerOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const openLightbox = useCallback((src: string) => setLightboxSrc(src), [])
  const closeLightbox = useCallback(() => setLightboxSrc(null), [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef(conversationId)
  const didInitialScrollRef = useRef(false)
  const userScrolledUpRef = useRef(false)
  const { data: messages = [], isLoading } = useGetMessages(conversationId)
  const { mutateAsync: sendMessageAsync, isPending } = useSendMessage(conversationId)

  if (prevConversationIdRef.current !== conversationId) {
    prevConversationIdRef.current = conversationId
    didInitialScrollRef.current = false
    userScrolledUpRef.current = false
  }

  // instant scroll to bottom when messages load
  useLayoutEffect(() => {
    if (messages.length === 0 || isLoading) return

    const el = scrollContainerRef.current
    if (!el) return

    const scrollToBottom = () => { el.scrollTop = el.scrollHeight }
    scrollToBottom()

    if (!didInitialScrollRef.current) {
      didInitialScrollRef.current = true
      const raf = requestAnimationFrame(scrollToBottom)
      return () => cancelAnimationFrame(raf)
    }
  }, [conversationId, messages.length, isLoading])

  // when content height changes (images/GIFs load), keep view at bottom unless user scrolled up
  useEffect(() => {
    const container = scrollContainerRef.current
    const content = contentWrapperRef.current
    if (!container || !content || messages.length === 0) return

    const scrollToBottom = () => {
      if (!userScrolledUpRef.current) container.scrollTop = container.scrollHeight
    }

    const ro = new ResizeObserver(() => scrollToBottom())
    ro.observe(content)

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - clientHeight - scrollTop > STICKY_BOTTOM_THRESHOLD) {
        userScrolledUpRef.current = true
      }
    }
    container.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      ro.disconnect()
      container.removeEventListener('scroll', onScroll)
    }
  }, [conversationId, messages.length])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if ((!text && !imageFile && !gifUrl) || isPending) return

    const payload = { content: text, imageFile: imageFile ?? undefined, gifUrl: gifUrl ?? undefined }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setInput('')
    setImageFile(null)
    setImagePreviewUrl(null)
    setGifUrl(null)

    if (fileInputRef.current) fileInputRef.current.value = ''
    try {
      await sendMessageAsync(payload)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to send')
    }
  }

  const canSend = input.trim().length > 0 || imageFile || gifUrl

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No messages yet. Send a message to start the conversation.
            </p>
          ) : (
            <div ref={contentWrapperRef}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isSelf={msg.senderUsername !== otherParticipant.username}
                  onImageClick={openLightbox}
                />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-0 p-4 border-t border-border bg-background">
          {(imageFile || gifUrl) && (
            <div className="flex items-start gap-2 mb-2">
              {imageFile && imagePreviewUrl && (
                <div className="relative inline-block">
                  <Image
                    src={imagePreviewUrl}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover border"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      URL.revokeObjectURL(imagePreviewUrl)
                      setImagePreviewUrl(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {gifUrl && (
                <div className="relative inline-block">
                  <Image
                    src={gifUrl}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover border"
                    alt="GIF"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setGifUrl(null)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setGifUrl(null)
                  setImageFile(file)
                  setImagePreviewUrl(URL.createObjectURL(file))
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || !!gifUrl}
              className="p-2 rounded-full hover:bg-primary/10 text-primary disabled:opacity-50"
              title="Add image"
            >
              <ImageIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => setGifPickerOpen(true)}
              disabled={isPending}
              className="p-2 rounded-full hover:bg-primary/10 text-primary font-bold text-sm disabled:opacity-50"
              title="Add GIF"
            >
              GIF
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message"
              maxLength={10000}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!canSend || isPending}>
              <Send size={18} />
            </Button>
          </div>
        </form>
        <GifPicker
          open={gifPickerOpen}
          onClose={() => setGifPickerOpen(false)}
          onSelect={(url) => {
            setGifUrl(url)
            setImageFile(null)
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
            setImagePreviewUrl(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            setGifPickerOpen(false)
          }}
        />
      </div>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox} />}
    </>

  )
}
