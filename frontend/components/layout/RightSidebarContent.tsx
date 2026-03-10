'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Search from '@/components/ui/Search'
import ConversationsList from '@/components/messages/ConversationsList'

export default function RightSidebarContent() {
  const pathname = usePathname()
  const isMessages = pathname === '/messages' || pathname?.startsWith('/messages')

  if (isMessages) {
    return (
      <Suspense fallback={<div className="animate-pulse h-24 rounded-lg bg-muted" />}>
        <ConversationsList />
      </Suspense>
    )
  }

  return (
    <div className="sticky top-3 z-20">
      <Suspense fallback={<div className="animate-pulse h-10 rounded-full bg-muted" />}>
        <Search />
      </Suspense>
    </div>
  )
}
