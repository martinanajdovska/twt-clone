'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INotificationResponse } from '@/DTO/INotificationResponse';
import Notification from '@/components/notifications/Notification';
import { useReadNotification } from '@/hooks/notifications/useReadNotification';
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications';

type NotificationTab = 'all' | 'mentions';

export default function NotificationDropdown() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const { mutate: readNotification } = useReadNotification();
  const { data: notifications = [] } = useGetNotifications();

  const filteredNotifications =
    activeTab === 'mentions'
      ? notifications.filter(
          (n: INotificationResponse) =>
            n.type === 'REPLY' || n.type === 'MENTION',
        )
      : notifications;

  const unreadCount = notifications.filter(
    (n: INotificationResponse) => !n.isRead,
  ).length;

  function readAll() {
    notifications.forEach((n: INotificationResponse) =>
      readNotification({ id: n.id }),
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent"
        >
          <Bell size={26} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-bold text-lg">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={readAll}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'mentions'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mentions
          </button>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {activeTab === 'mentions'
                ? 'No mentions yet.'
                : 'No notifications yet.'}
            </div>
          ) : (
            filteredNotifications.map((notification: INotificationResponse) => (
              <div key={notification.id}>
                <Notification notification={notification} />
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}