'use client'

import { usePathname } from 'next/navigation'
import Search from '@/components/ui/Search'
import { ModeToggle } from '@/components/ui/ModeToggle'
import ConversationsList from '@/components/messages/ConversationsList'

export default function RightSidebarContent() {
  const pathname = usePathname()
  const isMessages = pathname === '/messages' || pathname?.startsWith('/messages')

  if (isMessages) {
    return <ConversationsList />
  }

  return (
    <>
      <div className="sticky top-3 z-20">
        <Search />
      </div>
      <div className="relative z-0 p-4 bg-muted/50 dark:bg-[#16181c] rounded-2xl border border-border">
        <ModeToggle label="Theme" />
      </div>
    </>
  )
}
