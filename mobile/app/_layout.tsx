import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { AppState, Platform } from 'react-native';

import { registerForPushNotificationsAsync } from '@/lib/pushNotifications';
import { syncPushTokenToBackend } from '@/api/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { connectRealtime, disconnectRealtime } from '@/lib/realtime';
import { getStoredToken } from '@/lib/auth-store';


const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const qc = useQueryClient();

  const refreshRealtimeLists = React.useCallback(() => {
    // Refetch active screens immediately; keep inactive caches stale-aware.
    void qc.refetchQueries({ queryKey: ['notifications'], type: 'active' });
    void qc.refetchQueries({ queryKey: ['conversations'], type: 'active' });
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['conversations'] });
  }, [qc]);

  const handleNotificationLink = React.useCallback(
    (link: string | undefined | null) => {
      if (!link) return;

      const tweetMatch = link.match(/\/tweets\/(\d+)/);
      if (tweetMatch) {
        const id = tweetMatch[1];
        router.push(`/(tabs)/tweets/${id}` as any);
        return;
      }

      if (link.includes('/users/')) {
        const u = link.split('/users/')[1]?.split('/')[0] || link.split('/').pop();
        if (u) {
          router.push(`/(tabs)/users/${u}` as any);
          return;
        }
      }

      if (link.includes('/messages/')) {
        const id = link.split('/messages/')[1]?.split('/')[0];
        if (id) {
          router.push(`/(tabs)/conversation/${id}` as any);
          return;
        }
      }

      router.push('/(tabs)/(main)/notifications' as any);
    },
    [router],
  );

  React.useEffect(() => {
    let receivedSub: Notifications.EventSubscription | undefined;
    let responseSub: Notifications.EventSubscription | undefined;

    const invalidateForLink = (link: string | undefined) => {
      refreshRealtimeLists();
      if (!link) return;
      if (link.includes('/messages/')) {
        void qc.refetchQueries({ queryKey: ['messages'], type: 'active' });
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    (async () => {
      if (Platform.OS !== 'web') {
        // Handle notification that opened the app from a killed state
        const lastResponse = await Notifications.getLastNotificationResponse();
        if (lastResponse?.notification?.request?.content?.data) {
          const link = (lastResponse.notification.request.content.data as any)?.link as
            | string
            | undefined;
          handleNotificationLink(link);
        }
      }

      let token: string | null = null;
      try {
        token = await registerForPushNotificationsAsync();
      } catch {
        token = null;
      }
      if (token && !isLoading && isAuthenticated) {
        try {
          await syncPushTokenToBackend(token);
        } catch {
        }
      }

      if (Platform.OS !== 'web') {
        // Foreground push: refresh in-app caches immediately.
        receivedSub = Notifications.addNotificationReceivedListener((notification) => {
          const data = notification.request.content.data as any;
          const link: string | undefined = data?.link;
          invalidateForLink(link);
        });

        responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as any;
          const link: string | undefined = data?.link;

          invalidateForLink(link);
          handleNotificationLink(link);
        });
      }
    })();

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, [router, isAuthenticated, isLoading, handleNotificationLink, qc, refreshRealtimeLists]);

  React.useEffect(() => {
    let active = true;
    let socket: ReturnType<typeof connectRealtime> | null = null;

    (async () => {
      if (isLoading) return;
      if (!isAuthenticated) {
        disconnectRealtime();
        return;
      }
      const token = await getStoredToken();
      if (!active || !token) return;

      socket = connectRealtime(token);
      socket.off('notification');
      socket.off('new_message');
      socket.on('notification', () => {
        refreshRealtimeLists();
      });
      socket.on('new_message', (payload: { conversationId: number }) => {
        void qc.refetchQueries({ queryKey: ['conversations'], type: 'active' });
        qc.invalidateQueries({ queryKey: ['conversations'] });
        void qc.refetchQueries({ queryKey: ['messages'], type: 'active' });
        qc.invalidateQueries({ queryKey: ['messages', payload.conversationId] });
      });
    })();

    return () => {
      active = false;
      socket?.off('notification');
      socket?.off('new_message');
    };
  }, [isAuthenticated, isLoading, qc, refreshRealtimeLists]);

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated && !isLoading) {
        refreshRealtimeLists();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, isLoading, refreshRealtimeLists]);

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutContent />
            </GestureHandlerRootView>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
