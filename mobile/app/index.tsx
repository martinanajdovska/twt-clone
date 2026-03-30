import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ui/themed-view';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isPublicTweetPath = /^\/tweets\/\d+(?:\/quotes\/\d+)?\/?$/.test(pathname);

  useEffect(() => {
    if (pathname !== '/') return;
    if (isLoading) return;
    if (!isAuthenticated && isPublicTweetPath) {
      return;
    }
    if (isAuthenticated) {
      router.replace('/(main)/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, isPublicTweetPath, pathname]);

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});