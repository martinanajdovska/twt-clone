import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/ui/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { useFetchNotifications } from '@/hooks/notifications/useFetchNotifications';
import useFetchConversations from '@/hooks/messages/useFetchConversations';

export default function MainTabsLayout() {
  const colorScheme = useColorScheme();


  const { data: conversationsData } = useFetchConversations();
  const { data: notificationsData } = useFetchNotifications();

  const conversations = conversationsData?.pages.flatMap((page) => page ?? []) ?? [];
  const messagesUnreadCount = conversations.filter((c) => c.hasUnread).length;
  const notificationsUnreadCount = notificationsData?.pages[0]?.unreadCount ?? 0;

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
