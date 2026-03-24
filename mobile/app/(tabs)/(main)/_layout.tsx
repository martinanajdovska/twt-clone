import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/ui/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchConversations } from '@/api/messages';
import { fetchNotifications } from '@/api/notifications';

export default function MainTabsLayout() {
  const colorScheme = useColorScheme();

  const { data: conversationsData } = useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam }) => fetchConversations(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) => {
      const page = Array.isArray(lastPage) ? lastPage : [];
      return page.length < 10 ? undefined : (lastParam as number) + 1;
    },
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const conversations = conversationsData?.pages.flatMap((page) => page ?? []) ?? [];
  const messagesUnreadCount = conversations.filter((c) => c.hasUnread).length;
  const notificationsUnreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialIcons name="search" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <MaterialIcons name="notifications-none" size={26} color={color} />,
          tabBarBadge: notificationsUnreadCount > 0 ? notificationsUnreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MaterialIcons name="mail-outline" size={26} color={color} />,
          tabBarBadge: messagesUnreadCount > 0 ? messagesUnreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
