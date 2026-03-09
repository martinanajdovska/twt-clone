'use client'

import React from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications'
import type { INotificationResponse } from '@/DTO/INotificationResponse'

export default function NotificationLink() {
  const { data: notifications = [] } = useGetNotifications()
  const unreadCount = notifications.filter(
    (n: INotificationResponse) => !n.isRead
  ).length

  return (
    <Link
      href="/notifications"
      className="flex items-center gap-3 py-3 px-3 xl:px-3 text-[19px] font-normal rounded-full hover:bg-accent transition-colors w-fit xl:w-fit justify-center xl:justify-start min-w-[48px] relative"
    >
      <span className="relative shrink-0">
        <Bell size={26} strokeWidth={1.5} className="size-[26px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>
      <span className="hidden xl:inline">Notifications</span>
    </Link>
  )
}
