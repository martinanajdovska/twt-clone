'use client'

import React from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useGetUnreadCount } from '@/hooks/messages/useGetUnreadCount'

export default function MessagesLink() {
  const { data: unreadCount = 0 } = useGetUnreadCount()

  return (
    <Link
      href="/messages"
      className="relative flex h-[50px] items-center gap-3 px-3 text-[19px] leading-none font-normal rounded-full hover:bg-accent transition-colors w-fit md:group-hover:w-fit justify-center md:group-hover:justify-start min-w-[48px]"
    >
      <span className="relative shrink-0">
        <MessageCircle size={26} strokeWidth={1.5} className="size-[26px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>
      <span className="hidden md:group-hover:inline">Messages</span>
    </Link>
  )
}
