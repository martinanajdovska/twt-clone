import React, { useCallback, useMemo } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { TweetCard } from '@/components/tweets/TweetCard';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import type { ITweet } from '@/types/tweet';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import useFetchTweets from '@/hooks/tweets/useFetchTweets';
import { useCenteredVideoAutoplay } from '@/hooks/useCenteredVideoAutoplay';
import { warmVideoTweetIdsForFeed } from '@/lib/warmVideoTweetIds';

type FeedProps =
  | {
    mode: 'home';
    currentUsername: string;
    onScroll?: (e: any) => void;
    ListHeaderComponent?: React.ReactElement;
    autoplayEnabled?: boolean;
  }
  | {
    mode: 'profile';
    profileUsername: string;
    currentUsername: string;
    tab: 'tweets' | 'replies' | 'likes' | 'media';
    onScroll?: (e: any) => void;
    ListHeaderComponent?: React.ReactElement;
    autoplayEnabled?: boolean;
  };

export function Feed(props: FeedProps) {
  const { colorScheme } = useTheme();
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
  const autoplayEnabled = props.autoplayEnabled ?? true;
  const currentUsername = props.mode === 'home' ? props.currentUsername : props.currentUsername;
  const showPinned = props.mode === 'profile' && props.profileUsername === currentUsername;

  const extractVideoTweetId = useCallback((item: ITweet) => {
    return item.videoUrl ? item.id : null;
  }, []);

  const {
    activeVideoTweetId,
    viewportRef,
    setRowRef,
    scheduleRecompute,
    onViewableItemsChanged,
  } = useCenteredVideoAutoplay<ITweet>(extractVideoTweetId);

  const warmVideoTweetIds = useMemo(
    () => (autoplayEnabled ? warmVideoTweetIdsForFeed(tweets as ITweet[], activeVideoTweetId) : new Set<number>()),
    [autoplayEnabled, tweets, activeVideoTweetId]
  );

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 10,
    minimumViewTime: 0,
  });

  const renderItem = useCallback(
    ({ item }: { item: ITweet }) => (
      <View
        ref={(node) => {
          if (item.videoUrl) {
            setRowRef(item.id, node);
          }
        }}
        collapsable={false}
      >
        <TweetCard
          tweet={item}
          currentUsername={currentUsername}
          showPinnedLabel={showPinned}
          isVideoActive={autoplayEnabled && activeVideoTweetId === item.id}
          keepVideoPlayerWarm={warmVideoTweetIds.has(item.id)}
        />
      </View>
    ),
    [activeVideoTweetId, autoplayEnabled, currentUsername, showPinned, setRowRef, warmVideoTweetIds]
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
    <View ref={viewportRef} style={styles.viewport}>
      <FlatList
        data={tweets as ITweet[]}
        keyExtractor={(item, index) =>
          `${item.id}-${item.retweetedBy ?? 'original'}-${index}`
        }
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.list}
        onLayout={() => {
          scheduleRecompute();
        }}
        onScroll={(e) => {
          scheduleRecompute();
          props.onScroll?.(e);
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={props.ListHeaderComponent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        extraData={activeVideoTweetId}
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
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#f91880' },
  list: { paddingBottom: 24 },
  empty: { padding: 24, alignItems: 'center' },
  footer: { padding: 16, alignItems: 'center' },
});
