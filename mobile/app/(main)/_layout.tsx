import { Redirect, Stack, usePathname } from 'expo-router';
import React from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { AppDrawer } from '@/components/AppDrawer';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { ComposeProvider, useCompose } from '@/contexts/ComposeContext';
import { ComposeBottomSheet } from '@/components/tweets/ComposeBottomSheet';
import { ActivityIndicator, View } from 'react-native';

function PublicTweetsStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="tweets/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tweets/quotes/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

function PublicTweetsWithCompose() {
  return (
    <ComposeProvider>
      <PublicTweetsStack />
    </ComposeProvider>
  );
}

function TabsStack() {
  const { isVisible, closeCompose, parentId, quotedTweetId, topOffset } = useCompose();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="users/[username]" options={{ headerShown: false }} />
        <Stack.Screen name="tweets/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tweets/quotes/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="bookmarks" options={{ headerShown: false }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="reels" options={{ headerShown: false }} />
      </Stack>
      <ComposeBottomSheet
        isVisible={isVisible}
        onClose={closeCompose}
        parentId={parentId}
        quotedTweetId={quotedTweetId}
        topOffset={topOffset}
      />
    </>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isPublicTweetPath = /^\/tweets\/\d+(?:\/quotes\/\d+)?\/?$/.test(pathname);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (isPublicTweetPath) {
      return <PublicTweetsWithCompose />;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <DrawerProvider>
      <ComposeProvider>
        <AppDrawer />
        <TabsStack />
      </ComposeProvider>
    </DrawerProvider>
  );
}
