import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  useWindowDimensions,
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
  const { height: windowHeight } = useWindowDimensions();
  const [isReady, setIsReady] = useState(false);
  const [footerLaidOut, setFooterLaidOut] = useState(false);
  const itemLayouts = useRef<{ [key: number]: number }>({});
  const [headerHeight, setHeaderHeight] = useState(0);


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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
        renderItem={({ item, index }) => {
          const isMainTweet = index === mainTweetIndex && item.id === tweet?.id;

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
                />
              ) : (
                <TweetCard
                  tweet={item}
                  currentUsername={self?.username ?? ''}
                  showPinnedLabel={false}
                />
              )}
            </View>
          );
        }}
        ListFooterComponent={
          footerLaidOut ? (
            <View style={{ height: getFooterSpacerHeight() }} />
          ) : null
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
});