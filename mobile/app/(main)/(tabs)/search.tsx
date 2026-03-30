import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { TweetCard } from '@/components/tweets/TweetCard';
import type { ITweet } from '@/types/tweet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBox } from '@/components/search/SearchBox';
import { useFetchUsersByName } from '@/hooks/users/useFetchUsersByName';
import { useFetchTweetsBySearch } from '@/hooks/tweets/useFetchTweetsBySearch';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';


type Tab = 'users' | 'tweets';

export default function SearchScreen() {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [tab, setTab] = useState<Tab>('users');
  const insets = useSafeAreaInsets();


  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const { data: self } = useFetchSelf();
  const { data: users = [] as { username: string; displayName: string | null, imageUrl: string | null }[], isLoading: usersLoading } = useFetchUsersByName(debouncedQ);
  const { data: tweets = [], isLoading: tweetsLoading } = useFetchTweetsBySearch(debouncedQ);


  const isLoading = tab === 'users' ? usersLoading : tweetsLoading;


  const renderTweets = () => {
    return (
      <FlatList
        data={tweets as ITweet[]}
        keyExtractor={(item, index) => `tweet-${item.id}-${index}`}
        renderItem={({ item }) => (
          <TweetCard
            tweet={item}
            currentUsername={self?.username ?? ''}
            showPinnedLabel={false}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <ThemedView style={{ padding: 24, alignItems: 'center' }}>
            <ThemedText style={{ color: colors.icon }}>
              {debouncedQ.length > 0
                ? `No tweets found for "${debouncedQ}"`
                : 'Search for tweets by content.'}
            </ThemedText>
          </ThemedView>
        }
      />
    )
  }

  return (
    <SearchBox
      value={q}
      onChangeText={setQ}
      placeholder={tab === 'users' ? 'Search people' : 'Search tweets'}
      tabs={['users', 'tweets']}
      tab={tab}
      onTabChange={setTab}
      topInset={insets.top}
      isLoading={isLoading}
      users={users}
      onUserPress={(username) => router.push(`/(main)/users/${username}` as any)}
      userSecondaryText="View profile"
      renderTweets={renderTweets()}
      emptyUsersText={
        debouncedQ.length > 0
          ? `No users found for "${debouncedQ}"`
          : 'Search for people by username.'
      }
      emptyTweetsText={
        debouncedQ.length > 0
          ? `No tweets found for "${debouncedQ}"`
          : 'Search for tweets by content.'
      }
    />
  );
}