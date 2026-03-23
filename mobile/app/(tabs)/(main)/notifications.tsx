import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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

  const { data: notifications = [], isLoading, refetch } = useFetchNotifications();
  const { data: self, isLoading: selfLoading } = useFetchSelf();
  const { mutateAsync: readOne } = useReadNotification();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filtered =
    tab === 'mentions'
      ? notifications.filter((n) => n.type === 'REPLY' || n.type === 'MENTION')
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handlePress = async (n: INotificationItem) => {
    if (!n.isRead) await readOne(n.id);

    if (n.link) {
      const match = n.link.match(/\/tweets\/(\d+)/);
      if (match) router.push(`/(tabs)/tweets/${match[1]}` as any);

      else if (n.link.includes('/users/')) {
        const u = n.link.split('/users/')[1]?.split('/')[0] || n.link.split('/').pop();
        if (u) router.push(`/(tabs)/users/${u}` as any);
      }
    }
  };

  const readAll = () => {
    notifications.filter((n) => !n.isRead).forEach((n) => readOne(n.id));
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
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotificationRow
              item={item}
              onPress={() => handlePress(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>
                {tab === 'mentions' ? 'No mentions yet.' : 'No notifications yet.'}
              </ThemedText>
            </ThemedView>
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
});
