import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  useWindowDimensions,
  ViewToken,
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
import { usePaginatedTweetReplies } from '@/hooks/tweets/usePaginatedTweetReplies';

const REPLY_BAR_HEIGHT = 56;

export default function TweetDetailScreen() {
  const listRef = useRef<FlatList<ITweet>>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const tweetId = id ? parseInt(id, 10) : NaN;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isReady, setIsReady] = useState(false);
  const [footerLaidOut, setFooterLaidOut] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [hasStartedPagination, setHasStartedPagination] = useState(false);
  const itemLayouts = useRef<{ [key: number]: number }>({});
  const [headerHeight, setHeaderHeight] = useState(0);
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<number>>(new Set());


  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 35,
      minimumViewTime: 80,
    }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const sortedItems = [...viewableItems].sort(
        (a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER)
      );
      const topVisibleVideo = sortedItems.find((viewableItem) => {
        const tweet = viewableItem.item as ITweet | undefined;
        return Boolean(tweet?.id != null && tweet.videoUrl);
      });
      const nextIds = new Set<number>();
      const tweet = topVisibleVideo?.item as ITweet | undefined;
      if (tweet?.id != null) {
        nextIds.add(tweet.id);
      }
      setVisibleTweetIds(nextIds);
    }
  );

  const { data: self } = useFetchSelf();
  const { data, isLoading, refetch, isRefetching } = useFetchTweetDetails(tweetId);

  const { tweet, parentTweet, parentChain = [], replies: initialReplies = [] } = data ?? {};
  const ancestors: ITweet[] =
    parentChain.length > 0
      ? [...parentChain].reverse()
      : parentTweet
        ? [parentTweet]
        : [];
  const {
    replies: paginatedReplies,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetchRepliesPage,
    resetPagination,
  } = usePaginatedTweetReplies({
    tweetId,
    initialRepliesCount: data?.replies?.length,
    enabled: false,
  });

  const combinedReplies: ITweet[] = useMemo(() => {
    const all = [...initialReplies, ...paginatedReplies];
    const seen = new Set<number>();
    const deduped: ITweet[] = [];
    for (const r of all) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      deduped.push(r);
    }
    return deduped;
  }, [initialReplies, paginatedReplies]);

  const list: ITweet[] = [...ancestors, tweet ?? {} as ITweet, ...combinedReplies];
  const mainTweetIndex = ancestors.length;

  const onLayout = (index: number, height: number) => {
    itemLayouts.current[index] = height;
  };

  const getFooterSpacerHeight = () => {
    let repliesHeight = 0;
    for (let i = mainTweetIndex + 1; i < list.length; i++) {
      repliesHeight += itemLayouts.current[i] || 0;
    }

    const availableHeight = windowHeight - headerHeight - REPLY_BAR_HEIGHT - insets.bottom - insets.top - 175;

    const spacerHeight = Math.max(0, availableHeight - repliesHeight);
    return spacerHeight;
  };

  useEffect(() => {
    if (data && !isReady && footerLaidOut && mainTweetIndex > 0) {
      const timer = setTimeout(() => {
        let offset = 0;
        for (let i = 0; i < mainTweetIndex; i++) {
          offset += itemLayouts.current[i] || 0;
        }

        if (offset > 0) {
          listRef.current?.scrollToOffset({
            offset,
            animated: false,
          });
        }
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else if (data && !isReady && footerLaidOut && mainTweetIndex === 0) {
      setIsReady(true);
    }
  }, [data, isReady, footerLaidOut, mainTweetIndex]);

  useEffect(() => {
    if (data && !footerLaidOut) {
      const timer = setTimeout(() => {
        setFooterLaidOut(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [data, footerLaidOut]);

  useEffect(() => {
    setIsReady(false);
    setFooterLaidOut(false);
    setHasUserScrolled(false);
    setHasStartedPagination(false);
    itemLayouts.current = {};
  }, [tweetId]);

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
      <View
        onLayout={(e) => {
          setHeaderHeight(e.nativeEvent.layout.height);
        }}
      >
        <ScreenHeader title="Tweet" leftAction="back" />
      </View>

      {!isReady && (
        <ThemedView style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      )}

      <FlatList
        ref={listRef}
        data={list}
        keyExtractor={(item) => `tweet-${item.id}`}
        style={[styles.list, { opacity: isReady ? 1 : 0 }]}
        onEndReached={() => {
          if (!hasUserScrolled || isFetchingNextPage) return;
          if (!hasStartedPagination) {
            setHasStartedPagination(true);
            refetchRepliesPage();
            return;
          }
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y > 0 && !hasUserScrolled) {
            setHasUserScrolled(true);
          }
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              resetPagination();
              setHasStartedPagination(false);
              refetch();
            }}
          />
        }
        renderItem={({ item, index }) => {
          const isMainTweet = index === mainTweetIndex && item.id === tweet?.id;
          const isVideoActive = visibleTweetIds.has(item.id);

          return (
            <View
              onLayout={(e) => {
                const { height } = e.nativeEvent.layout;
                onLayout(index, height);
              }}
            >
              {isMainTweet ? (
                <TweetCardDetailView
                  tweet={item}
                  showPinnedLabel={false}
                  currentUsername={self?.username ?? ''}
                  isVideoActive={isVideoActive}
                />
              ) : (
                <TweetCard
                  tweet={item}
                  currentUsername={self?.username ?? ''}
                  showPinnedLabel={false}
                  isVideoActive={isVideoActive}
                />
              )}
            </View>
          );
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        extraData={visibleTweetIds}
        ListFooterComponent={
          <View>
            {isFetchingNextPage ? (
              <View style={styles.repliesLoadingFooter}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null}
            {footerLaidOut ? <View style={{ height: getFooterSpacerHeight() }} /> : null}
          </View>
        }
        contentContainerStyle={[
          { paddingBottom: REPLY_BAR_HEIGHT + insets.bottom },
        ]}
      />

      {self && tweet && <Reply self={self} tweet={tweet} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  repliesLoadingFooter: { paddingVertical: 16, alignItems: 'center' },
});