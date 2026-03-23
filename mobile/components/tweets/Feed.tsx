import React, { useCallback } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { TweetCard } from '@/components/tweets/TweetCard';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import type { ITweet } from '@/types/tweet';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchTweets from '@/hooks/tweets/useFetchTweets';

type FeedProps =
  | { mode: 'home'; currentUsername: string; onScroll?: (e: any) => void; ListHeaderComponent?: React.ReactElement }
  | {
    mode: 'profile';
    profileUsername: string;
    currentUsername: string;
    tab: 'tweets' | 'replies' | 'likes' | 'media';
    onScroll?: (e: any) => void;
    ListHeaderComponent?: React.ReactElement;
  };

export function Feed(props: FeedProps) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];

  const queryKey =
    props.mode === 'home'
      ? ['feed']
      : ['profile', props.profileUsername, props.tab];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useFetchTweets(queryKey);

  const tweets = data?.pages.flat() ?? [];
  const currentUsername = props.mode === 'home' ? props.currentUsername : props.currentUsername;
  const showPinned = props.mode === 'profile' && props.profileUsername === currentUsername;

  const renderItem = useCallback(
    ({ item }: { item: ITweet }) => (
      <TweetCard
        tweet={item}
        currentUsername={currentUsername}
        showPinnedLabel={showPinned}
      />
    ),
    [currentUsername, showPinned]
  );

  if (status === 'pending') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (status === 'error') {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.error}>Failed to load feed</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={tweets as ITweet[]}
      keyExtractor={(item, index) =>
        `${item.id}-${item.retweetedBy ?? 'original'}-${index}`
      }
      renderItem={renderItem}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.list}
      onScroll={props.onScroll}
      scrollEventThrottle={16}
      ListHeaderComponent={props.ListHeaderComponent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
        />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <ThemedView style={styles.empty}>
          <ThemedText>No tweets here yet.</ThemedText>
        </ThemedView>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#f91880' },
  list: { paddingBottom: 24 },
  empty: { padding: 24, alignItems: 'center' },
  footer: { padding: 16, alignItems: 'center' },
});