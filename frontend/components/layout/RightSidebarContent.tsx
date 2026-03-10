'use client'

import { usePathname } from 'next/navigation'
import Search from '@/components/ui/Search'
import ConversationsList from '@/components/messages/ConversationsList'

export default function RightSidebarContent() {
  const pathname = usePathname()
  const isMessages = pathname === '/messages' || pathname?.startsWith('/messages')

  if (isMessages) {
    return <ConversationsList />
  }

  return (
    <div className="sticky top-3 z-20">
      <Search />
    </div>
  )
}
