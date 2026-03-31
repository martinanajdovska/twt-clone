'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetConversations } from '@/hooks/messages/useGetConversations'
import NewMessageDialog from './NewMessageDialog'
import ConversationListItem from './ConversationsListItem'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'


export default function ConversationsList({ variant = 'sidebar' }: { variant?: 'sidebar' | 'center' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation')
  const currentId = conversationIdParam ? parseInt(conversationIdParam, 10) : null
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetConversations()
  const conversations = data?.pages.flatMap((p) => p.content ?? []) ?? []
  const isCenter = variant === 'center'

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const onCreated = (id: number) => {
    router.push(`/messages?conversation=${id}`)
  }

  const conversationItems = conversations.length === 0 ? (
    <p className="text-sm text-muted-foreground py-4 text-center">
      No conversations yet. Start a new message.
    </p>
  ) : (
    conversations.map((conv) => (
      <div key={conv.id} className="w-full min-w-0 max-w-full">
        <ConversationListItem conv={conv} currentId={currentId} />
      </div>
    ))
  )

  return (
    <div className={`w-full min-w-0 max-w-full flex flex-col gap-4 ${isCenter ? '' : 'h-fit'}`}>
      <NewMessageDialog onCreated={onCreated} />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : isCenter ? (
        <div className="flex flex-col gap-1">
          {conversationItems}
          <div ref={ref} className="py-4 flex justify-center items-center text-muted-foreground text-sm">
            {isFetchingNextPage ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                <span>Loading more conversations...</span>
              </div>
            ) : hasNextPage ? (
              <span className="text-xs">Scroll for more</span>
            ) : null}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 w-full min-w-0 max-h-[calc(100vh-220px)] [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full [&_[data-slot=scroll-area-viewport]>div]:!min-w-0">
          <div className="flex flex-col gap-1 pr-2 w-full min-w-0">
            {conversationItems}

            <div ref={ref} className="py-4 flex justify-center items-center text-muted-foreground text-xs">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  <span>Loading...</span>
                </div>
              ) : hasNextPage ? (
                <span className="opacity-60">Scroll for more</span>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
