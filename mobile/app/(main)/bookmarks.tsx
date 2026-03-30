import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { TweetCard } from '@/components/tweets/TweetCard';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenHeader } from '@/components/ScreenHeader';
import useFetchBookmarks from '@/hooks/bookmarks/useFetchBookmarks';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';


export default function BookmarksScreen() {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];


  const { data: self } = useFetchSelf();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useFetchBookmarks();

  const tweets = data?.pages.flat() ?? [];

  if (status === 'pending') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Bookmarks" />

      <FlatList
        data={tweets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TweetCard tweet={item} currentUsername={self?.username ?? ''} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <MaterialIcons name="bookmark-border" size={48} color={colors.icon} />
            <ThemedText style={styles.emptyText}>No bookmarks yet.</ThemedText>
            <ThemedText style={[styles.emptySub, { color: colors.icon }]}>
              Bookmark tweets to find them here.
            </ThemedText>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 24 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { marginTop: 12 },
  emptySub: { marginTop: 4, fontSize: 14 },
  footer: { padding: 16, alignItems: 'center' },
});