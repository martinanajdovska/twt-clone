'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Notification from '@/components/notifications/Notification'
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications'
import { useReadNotification } from '@/hooks/notifications/useReadNotification'
import type { INotificationResponse } from '@/DTO/INotificationResponse'
import { useInView } from 'react-intersection-observer'

type NotificationTab = 'all' | 'mentions'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNotifications()
  const notifications = data?.pages.flatMap((p) => p.content ?? []) ?? []
  const { mutate: readNotification } = useReadNotification()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])


  const filteredNotifications =
    activeTab === 'mentions'
      ? notifications.filter(
        (n: INotificationResponse) =>
          n.type === 'REPLY' || n.type === 'MENTION'
      )
      : notifications

  const unreadCount =
    data?.pages?.[0]?.unreadCount ??
    notifications.filter((n: INotificationResponse) => !n.isRead).length

  function readAll() {
    notifications.forEach((n: INotificationResponse) =>
      readNotification(n.id)
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-semibold"
              onClick={readAll}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-[15px] font-medium transition-colors ${activeTab === 'all'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`flex-1 py-3 text-[15px] font-medium transition-colors ${activeTab === 'mentions'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Mentions
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="min-h-[200px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {activeTab === 'mentions'
                  ? 'No mentions yet.'
                  : 'No notifications yet.'}
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification: INotificationResponse) => (
                  <div key={notification.id}>
                    <Notification notification={notification} />
                  </div>
                ))}
                {hasNextPage && (
                  <div ref={ref} className="p-4 flex justify-center">
                    {isFetchingNextPage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        <span>Loading more conversations...</span>
                      </div>
                    ) : hasNextPage ? (
                      <span className="text-xs">Scroll for more</span>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
