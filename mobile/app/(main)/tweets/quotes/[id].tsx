import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { TweetCard } from '@/components/tweets/TweetCard';
import type { ITweet } from '@/types/tweet';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { useFetchTweetQuotes } from '@/hooks/tweets/useFetchTweetQuotes';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';

export default function TweetQuotesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colorScheme } = useTheme();
    const colors = Colors[colorScheme];
    const tweetId = id ? parseInt(id, 10) : NaN;

    const { data: self } = useFetchSelf();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchTweetQuotes(tweetId);
    const quotes = data?.pages.flat() ?? [];

    if (isNaN(tweetId)) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>Invalid tweet</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScreenHeader
                title="Quotes"
                leftAction="back"
            />

            {isLoading ? (
                <ThemedView style={styles.center}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </ThemedView>
            ) : (
                <FlatList
                    data={quotes}
                    keyExtractor={(item, index) => `quote-${item.id}-${index}`}
                    renderItem={({ item }) => (
                        <TweetCard
                            tweet={item as ITweet}
                            currentUsername={self?.username ?? ''}
                            showPinnedLabel={false}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={
                        <ThemedView style={styles.empty}>
                            <ThemedText>No quotes yet.</ThemedText>
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
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 24 },
    empty: { padding: 24, alignItems: 'center' },
    footer: { padding: 16, alignItems: 'center' },
});