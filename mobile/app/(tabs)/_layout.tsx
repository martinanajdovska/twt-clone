import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { AppDrawer } from '@/components/AppDrawer';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { ComposeProvider, useCompose } from '@/contexts/ComposeContext';
import { ComposeBottomSheet } from '@/components/tweets/ComposeBottomSheet';
import { ActivityIndicator, View } from 'react-native';

function TabsStack() {
  const { isVisible, closeCompose, parentId, quotedTweetId, topOffset } = useCompose();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="(main)"
      >
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
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


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <DrawerProvider>
      <ComposeProvider>
        <AppDrawer />
        <TabsStack />
      </ComposeProvider>
    </DrawerProvider>

  );
}
