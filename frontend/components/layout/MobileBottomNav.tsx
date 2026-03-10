'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Home, Search as SearchIcon, Bell, MessageCircle } from 'lucide-react'
import Search from '@/components/ui/Search'
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications'
import { useGetUnreadCount } from '@/hooks/messages/useGetUnreadCount'
import type { INotificationResponse } from '@/DTO/INotificationResponse'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function MobileBottomNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: notifications = [] } = useGetNotifications()
  const { data: messagesUnreadCount = 0 } = useGetUnreadCount()
  const notificationUnreadCount = notifications.filter(
    (n: INotificationResponse) => !n.isRead && n.type !== 'MESSAGE'
  ).length

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around py-2 bg-background/80 backdrop-blur-md border-t border-border md:hidden">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 py-2 px-4 rounded-full hover:bg-accent transition-colors text-foreground"
        aria-label="Home"
      >
        <Home size={26} strokeWidth={1.5} />
        <span className="text-[11px] font-normal">Home</span>
      </Link>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-full hover:bg-accent transition-colors text-foreground"
            aria-label="Search"
          >
            <SearchIcon size={26} strokeWidth={1.5} />
            <span className="text-[11px] font-normal">Search</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[100vw] sm:max-w-md top-[10%] translate-y-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="pt-2">
            <Search onNavigate={() => setSearchOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
      <Link
        href="/messages"
        className="flex flex-col items-center gap-1 py-2 px-4 rounded-full hover:bg-accent transition-colors text-foreground relative"
        aria-label="Messages"
      >
        <span className="relative">
          <MessageCircle size={26} strokeWidth={1.5} />
          {messagesUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
              {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
            </span>
          )}
        </span>
        <span className="text-[11px] font-normal">Messages</span>
      </Link>
      <Link
        href="/notifications"
        className="flex flex-col items-center gap-1 py-2 px-4 rounded-full hover:bg-accent transition-colors text-foreground relative"
        aria-label="Notifications"
      >
        <span className="relative">
          <Bell size={26} strokeWidth={1.5} />
          {notificationUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
              {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
            </span>
          )}
        </span>
        <span className="text-[11px] font-normal">Notifications</span>
      </Link>
    </nav>
  )
}
