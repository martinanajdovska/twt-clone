'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGetMessages } from '@/hooks/messages/useGetMessages'
import { useSendMessage } from '@/hooks/messages/useSendMessage'
import MessageBubble from './MessageBubble'

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const { data: messages = [], isLoading } = useGetMessages(conversationId)
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isPending) return
    setInput('')
    try {
      await sendMessage(text)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to send')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]"> {/* 56px = header height */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No messages yet. Send a message to start the conversation.
          </p>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isSelf={msg.senderUsername !== otherParticipant.username}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message"
            maxLength={10000}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || isPending}>
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
}
