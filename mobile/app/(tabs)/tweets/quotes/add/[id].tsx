import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { TweetForm } from '@/components/tweets/TweetForm';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchTweetDetails } from '@/hooks/tweets/useFetchTweetDetails';

export default function QuoteTweetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const quoteTweetId = id ? parseInt(id, 10) : NaN;


  const { data: self } = useFetchSelf();
  const { data, isLoading, refetch } = useFetchTweetDetails(quoteTweetId);

  if (isNaN(quoteTweetId)) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Invalid tweet</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <ThemedText style={{ color: colors.tint }}>Go back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (isLoading || !data) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  const quotedTweet = data.tweet;

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Quote"
        leftAction="back"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {self && (
            <TweetForm
              username={self.username}
              profilePictureUrl={self.profilePicture}
              quotedTweetId={quoteTweetId}
              quotedTweet={{
                id: quotedTweet.id,
                username: quotedTweet.username,
                content: quotedTweet.content,
                imageUrl: quotedTweet.imageUrl,
                createdAt: quotedTweet.createdAt,
                profilePictureUrl: quotedTweet.profilePictureUrl,
              }}
              placeholder="Add a comment"
              autoFocus
              onSuccess={() => {
                refetch();
                router.back();
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backLink: { marginTop: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
});
