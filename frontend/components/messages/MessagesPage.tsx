'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useGetConversations } from '@/hooks/messages/useGetConversations'
import { useGetConversation } from '@/hooks/messages/useGetConversation'
import { useMarkConversationAsRead } from '@/hooks/messages/useMarkConversationAsRead'
import { searchConversationMessages } from '@/api-calls/messages-api'
import ConversationView from './ConversationView'
import ConversationsList from './ConversationsList'
import MessagesHeader from './MessagesHeader'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation')
  const conversationId = conversationIdParam ? parseInt(conversationIdParam, 10) : null
  const { data: conversationsData } = useGetConversations()
  const conversations = useMemo(
    () => conversationsData?.pages.flatMap((p) => p.content ?? []) ?? [],
    [conversationsData],
  )
  const { data: conversationDetail, isLoading: loadingDetail } = useGetConversation(conversationId)
  const { mutate: markAsRead } = useMarkConversationAsRead()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: number; content: string; createdAt: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTarget, setSearchTarget] = useState<{ id: number; createdAt: string } | null>(null)
  const currentConversation = conversationId
    ? conversations.find((c) => c.id === conversationId) ?? conversationDetail ?? null
    : null

  const router = useRouter()

  useEffect(() => {
    if (conversationId != null && currentConversation) {
      markAsRead(conversationId)
    }
  }, [conversationId, currentConversation, markAsRead])

  useEffect(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchTarget(null)
  }, [conversationId])

  useEffect(() => {
    if (conversationId != null) {
      localStorage.setItem('lastOpenedConversation', String(conversationId))
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId == null && conversations.length > 0) {
      const lastId = localStorage.getItem('lastOpenedConversation')
      if (!lastId) return
      const exists = conversations.find((c) => c.id === parseInt(lastId, 10))
      if (exists && window.innerWidth >= 1024) {
        router.replace(`/messages?conversation=${lastId}`)
      }
    }
  }, [conversations, conversationId, router])

  useEffect(() => {
    if (!currentConversation) return
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchConversationMessages(
          currentConversation.id,
          currentConversation.otherParticipant.username,
          q,
        )
        setSearchResults(
          results.map((r) => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt,
          })),
        )
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery, currentConversation])

  if (conversationId != null && currentConversation) {
    return (
      <div className="flex flex-col h-full justify-between">
        <MessagesHeader
          otherParticipant={currentConversation.otherParticipant}
          showSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          onSelectSearchResult={(result) => {
            setSearchTarget({ id: result.id, createdAt: result.createdAt })
            setSearchResults([])
          }}
        />
        {loadingDetail && !conversations.find((c) => c.id === conversationId) ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ConversationView
            conversationId={currentConversation.id}
            otherParticipant={currentConversation.otherParticipant}
            searchTarget={searchTarget}
          />
        )}
      </div>
    )
  }

  if (conversationId != null && !loadingDetail && !currentConversation) {
    return (
      <div className="flex flex-col">
        <MessagesHeader otherParticipant={null} />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" strokeWidth={1} />
          <h2 className="text-xl font-bold text-foreground mb-2">Conversation not found</h2>
          <p className="text-muted-foreground max-w-sm">
            This conversation may have been deleted or you don’t have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <MessagesHeader otherParticipant={null} />
      {/* small screens: show conversation list in center */}
      <div className="lg:hidden px-3 py-4 pb-24">
        <ConversationsList variant="center" />
      </div>
      {/* large screens: empty state (list is in right sidebar) */}
      <div className="hidden lg:flex flex flex-col items-center justify-center py-24 px-4 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" strokeWidth={1} />
        <h2 className="text-xl font-bold text-foreground mb-2">Select a conversation</h2>
        <p className="text-muted-foreground max-w-sm">
          Choose a conversation from the right sidebar or start a new message to begin.
        </p>
      </div>
    </div>
  )
}
