import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';

export default function ProfileTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: self, isLoading, isError } = useFetchSelf();

  useEffect(() => {
    if (self?.username) {
      router.push(`/(tabs)/users/${self.username}` as any);
    }
  }, [self?.username]);

  useEffect(() => {
    if (!isLoading && (isError || !self)) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isError, self]);

  if (isLoading || !self) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
