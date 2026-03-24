import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TweetCard } from '@/components/tweets/TweetCard';
import type { ITweet } from '@/types/tweet';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useFetchProfileFeed } from '@/hooks/users/useFetchProfileFeed';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchProfileHeader } from '@/hooks/users/useFetchProfileHeader';
import { useCompose } from '@/contexts/ComposeContext';


const TABS = ['tweets', 'replies', 'likes', 'media'] as const;
const HEADER_FADE_THRESHOLD = 160;
const FLOATING_BUTTON_SIZE = 56;
const BACK_BUTTON_SIZE = 36;

type TabType = (typeof TABS)[number];
type ListItem =
  | { type: 'header'; id: string }
  | { type: 'tabs'; id: string }
  | { type: 'tweet'; id: string; data: ITweet };

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { openCompose } = useCompose();
  const insets = useSafeAreaInsets();

  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const themeColors = {
    border: isDark ? '#3d4146' : '#d8dde1',
    text: colors.text,
    background: colors.background,
    muted: colors.icon,
    tint: colors.tint,
  };

  const [tab, setTab] = useState<TabType>('tweets');
  const [profileHeaderHeight, setProfileHeaderHeight] = useState(0);
  const scrollY = useSharedValue(0);

  const { data: self } = useFetchSelf();
  const { data: profile, isLoading } = useFetchProfileHeader(username);
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFetchProfileFeed(username, tab);

  const tweets = feedData?.pages.flat() ?? [];
  const isSelf = self?.username === username;
  const stickyHeaderHeight = insets.top + 12 + 22 + 10 + 10;


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_FADE_THRESHOLD - 1, HEADER_FADE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const floatingBackStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_FADE_THRESHOLD - 1, HEADER_FADE_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const tabsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [
        Math.max(0, profileHeaderHeight - stickyHeaderHeight),
        profileHeaderHeight,
      ],
      [0, stickyHeaderHeight],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });


  const handleBackPress = () => router.back();
  const handleComposePress = () => openCompose();
  const handleTabPress = (selectedTab: TabType) => setTab(selectedTab);

  const handleProfileHeaderLayout = (height: number) => {
    if (profileHeaderHeight === 0) {
      setProfileHeaderHeight(height);
    }
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderProfileHeader = () => (
    <View
      onLayout={(event) => {
        handleProfileHeaderLayout(event.nativeEvent.layout.height);
      }}
    >
      <ProfileHeader profile={profile!} isSelf={isSelf} />
    </View>
  );

  const renderTabs = () => (
    <Animated.View
      style={[
        styles.tabs,
        {
          borderBottomColor: themeColors.border,
          backgroundColor: themeColors.background,
        },
        tabsStyle,
      ]}
      pointerEvents="auto"
    >
      {TABS.map((t) => {
        const isActive = tab === t;
        return (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => handleTabPress(t)}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color: isActive ? themeColors.text : themeColors.muted,
                  fontWeight: isActive ? '700' : '400',
                },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );

  const renderTweetItem = (tweet: ITweet) => (
    <TweetCard
      tweet={tweet}
      currentUsername={self?.username ?? ''}
      showPinnedLabel={isSelf}
    />
  );

  const renderListItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') return renderProfileHeader();
    if (item.type === 'tabs') return renderTabs();
    return renderTweetItem(item.data as ITweet);
  };

  const renderEmptyState = () =>
    tweets.length === 0 ? (
      <ThemedView style={styles.empty}>
        <ThemedText>No tweets here yet.</ThemedText>
      </ThemedView>
    ) : null;

  const renderFooter = () =>
    isFetchingNextPage ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={themeColors.tint} />
      </View>
    ) : null;


  if (!username) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Invalid user</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading || !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </ThemedView>
    );
  }


  const listData: ListItem[] = [
    { type: 'header', id: 'profile-header' },
    { type: 'tabs', id: 'tabs' },
    ...tweets.map((tweet, index) => ({
      type: 'tweet' as const,
      id: `tweet-${tweet.id}-${index}`,
      data: tweet,
    })),
  ];

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Sticky Header with Back Button */}
      <Animated.View
        collapsable={false}
        style={[
          styles.stickyHeader,
          {
            backgroundColor: themeColors.background,
            borderBottomColor: themeColors.border,
          },
          stickyHeaderStyle,
        ]}
      >
        <View
          collapsable={false}
          style={[styles.stickyTopRow, { paddingTop: insets.top + 12 }]}
        >
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.stickyBackBtn}
            hitSlop={8}
          >
            <MaterialIcons name="arrow-back" size={22} color={themeColors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.stickyUsername, { color: themeColors.text }]}>
            {profile.displayName || username}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Floating Back Button */}
      <Animated.View
        collapsable={false}
        style={[
          styles.floatingBack,
          { top: insets.top + 8 },
          floatingBackStyle,
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.floatingBackBtn}
          hitSlop={8}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main content list */}
      <Animated.FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={[1]}
        renderItem={renderListItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        ListEmptyComponent={renderEmptyState()}
        ListFooterComponent={renderFooter()}
      />

      {/* Floating Action Button */}
      {isSelf && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 20 }]}
          onPress={handleComposePress}
          activeOpacity={0.85}
        >
          <MaterialIcons name="edit" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBack: {
    position: 'absolute',
    left: 11,
    zIndex: 10,
  },
  floatingBackBtn: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: BACK_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    elevation: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stickyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  stickyBackBtn: {
    padding: 6,
    marginRight: 12,
  },
  stickyUsername: {
    fontSize: 17,
    fontWeight: '800',
  },
  tabs: {
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1d9bf0',
  },
  tabText: {
    fontSize: 15,
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    borderRadius: FLOATING_BUTTON_SIZE / 2,
    backgroundColor: '#1d9bf0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});