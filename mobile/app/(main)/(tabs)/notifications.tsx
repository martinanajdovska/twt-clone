import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Colors } from '@/constants/theme';
import type { INotificationItem } from '@/types/notification';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawer } from '@/contexts/DrawerContext';
import NotificationRow from '@/components/notifications/NotificationRow';
import { useReadNotification } from '@/hooks/notifications/useReadNotification';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchNotifications } from '@/hooks/notifications/useFetchNotifications';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function NotificationsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'mentions'>('all');
  const { openDrawer } = useDrawer();

  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const borderColor = isDark ? '#3d4146' : '#d8dde1';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching } = useFetchNotifications();

  const notifications = data?.pages.flatMap((page) => page.content ?? []) ?? [];
  const { data: self, isLoading: selfLoading } = useFetchSelf();
  const { mutateAsync: readOne } = useReadNotification();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filtered =
    tab === 'mentions'
      ? notifications.filter((n: INotificationItem) => n.type === 'REPLY' || n.type === 'MENTION')
      : notifications;

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const handlePress = async (n: INotificationItem) => {
    if (!n.isRead) await readOne(n.id);

    if (n.link) {
      const match = n.link.match(/\/tweets\/(\d+)/);
      if (match) router.push(`/(main)/tweets/${match[1]}` as any);

      else if (n.link.includes('/users/')) {
        const u = n.link.split('/users/')[1]?.split('/')[0] || n.link.split('/').pop();
        if (u) router.push(`/(main)/users/${u}` as any);
      }
    }
  };

  const readAll = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => readOne(id)));
    // await refetch();
  };

  // Get unread background color based on theme
  const getUnreadBackgroundColor = () => {
    if (isDark) {
      return '#1a2633'; // Darker blue tint for dark mode
    }
    return '#e8f5fe'; // Light blue tint for light mode
  };

  // Get unread border color based on theme
  const getUnreadBorderColor = () => {
    if (isDark) {
      return '#1d9bf0'; // Bright blue border for dark mode
    }
    return '#1d9bf0'; // Blue border for light mode
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Notifications"
        leftAction="avatar"
        onLeftPress={openDrawer}
        avatarUrl={self?.profilePicture}
        avatarFallbackText={self?.username?.charAt(0).toUpperCase()}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={readAll}>
              <ThemedText style={{ color: '#1d9bf0', fontSize: 15 }}>
                Mark all read
              </ThemedText>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <View style={[styles.tabs, { borderBottomColor: borderColor }]}>
        {(['all', 'mentions'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: borderColor }]}
            onPress={() => setTab(t)}
          >
            <ThemedText style={[tab === t ? {} : { opacity: 0.7 }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {status === 'pending' ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notificationWrapper,
                !item.isRead && {
                  backgroundColor: getUnreadBackgroundColor(),
                  borderLeftWidth: 3,
                  borderLeftColor: getUnreadBorderColor(),
                },
              ]}
            >
              <NotificationRow
                item={item}
                onPress={() => handlePress(item)}
              />
              {!item.isRead && (
                <View style={[styles.unreadIndicator, { backgroundColor: getUnreadBorderColor() }]} />
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>
                {tab === 'mentions' ? 'No mentions yet.' : 'No notifications yet.'}
              </ThemedText>
            </ThemedView>
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row' },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 24 },
  empty: { padding: 24, alignItems: 'center' },
  footer: { padding: 16, alignItems: 'center' },
  notificationWrapper: {
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    top: '50%',
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateY: -4 }],
  },
});