import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { TweetCard } from '@/components/tweets/TweetCard';
import type { ITweet } from '@/types/tweet';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import Reply from '@/components/tweets/Reply';
import { TweetCardDetailView } from '../../../components/tweets/TweetCardDetailView';
import { useFetchTweetDetails } from '@/hooks/tweets/useFetchTweetDetails';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';


const REPLY_BAR_HEIGHT = 56;

export default function TweetDetailScreen() {
  const listRef = useRef<FlatList<ITweet>>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const tweetId = id ? parseInt(id, 10) : NaN;
  const insets = useSafeAreaInsets();
  const [hasScrolled, setHasScrolled] = useState(false);

  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];


  const { data: self } = useFetchSelf();
  const { data, isLoading, refetch, isRefetching } = useFetchTweetDetails(tweetId);

  const { tweet, parentTweet, parentChain = [], replies = [] } = data ?? {};
  const ancestors: ITweet[] =
    parentChain.length > 0
      ? [...parentChain].reverse()
      : parentTweet
        ? [parentTweet]
        : [];
  const list: ITweet[] = [...ancestors, tweet ?? {} as ITweet, ...replies];
  const mainTweetIndex = ancestors.length;

  // Scroll to main tweet after layout
  useEffect(() => {
    if (!hasScrolled && mainTweetIndex > 0) {
      // Small delay to ensure items are laid out
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: mainTweetIndex,
          animated: false,
          viewPosition: 0 // Position at top of viewport
        });
        setHasScrolled(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mainTweetIndex, hasScrolled]);

  if (isNaN(tweetId)) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Invalid tweet</ThemedText>
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


  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Tweet"
        leftAction="back"
      />

      {/* List of replies */}
      <FlatList
        ref={listRef}
        data={list}
        keyExtractor={(item) => `tweet-${item.id}`}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, animated: false });
          }, 100);
        }}
        // Remove initialScrollIndex - we handle scroll in useEffect instead
        // This allows all items to render first
        maintainVisibleContentPosition={
          hasScrolled
            ? undefined
            : {
              minIndexForVisible: 0,
            }
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        renderItem={({ item, index }) => {
          const isMainTweet = index === ancestors.length && item.id === tweet?.id;
          if (isMainTweet) {
            return (
              <TweetCardDetailView
                tweet={item}
                showPinnedLabel={false}
                currentUsername={self?.username ?? ''}
              />
            );
          }

          return (
            <TweetCard
              tweet={item}
              currentUsername={self?.username ?? ''}
              showPinnedLabel={false}
            />
          );
        }}
        contentContainerStyle={[styles.list, { paddingBottom: REPLY_BAR_HEIGHT + insets.bottom }]}
      />

      {self && tweet && <Reply self={self} tweet={tweet} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 24 },
});