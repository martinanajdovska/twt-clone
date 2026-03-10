'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetConversations } from '@/hooks/messages/useGetConversations'
import NewMessageDialog from './NewMessageDialog'
import ConversationListItem from './ConversationsListItem'


export default function ConversationsList({ variant = 'sidebar' }: { variant?: 'sidebar' | 'center' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation')
  const currentId = conversationIdParam ? parseInt(conversationIdParam, 10) : null
  const { data: conversations = [], isLoading } = useGetConversations()

  const onCreated = (id: number) => {
    router.push(`/messages?conversation=${id}`)
  }

  const isCenter = variant === 'center'

  const conversationItems = conversations.length === 0 ? (
    <p className="text-sm text-muted-foreground py-4 text-center">
      No conversations yet. Start a new message.
    </p>
  ) : (
    conversations.map((conv) => (
      <ConversationListItem key={conv.id} conv={conv} currentId={currentId} />
    ))
  )

  return (
    <div className={`flex flex-col gap-4 ${isCenter ? '' : 'h-fit'}`}>
      <NewMessageDialog onCreated={onCreated} />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : isCenter ? (
        <div className="flex flex-col gap-1">
          {conversationItems}
        </div>
      ) : (
        <ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
          <div className="flex flex-col gap-1 pr-2">
            {conversationItems}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
