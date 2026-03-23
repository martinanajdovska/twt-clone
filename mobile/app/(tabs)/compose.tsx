import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ui/themed-view';
import { TweetForm, QuotedTweetPreview } from '@/components/tweets/TweetForm';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchTweetDetails } from '@/hooks/tweets/useFetchTweetDetails';

export default function ComposeScreen() {
    const router = useRouter();
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const { parentId: parentIdParam, quotedTweetId: quotedTweetIdParam } =
        useLocalSearchParams<{ parentId?: string; quotedTweetId?: string }>();

    const parentId = parentIdParam ? Number(parentIdParam) : undefined;
    const quotedTweetId = quotedTweetIdParam ? Number(quotedTweetIdParam) : undefined;

    const [canSubmit, setCanSubmit] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [submitTrigger, setSubmitTrigger] = useState(0);

    const { data: self, isLoading: selfLoading } = useFetchSelf();
    const { data: quotedTweetData, isLoading: quotedLoading } = useFetchTweetDetails(quotedTweetId);

    const primaryLabel = parentId
        ? 'Reply'
        : quotedTweetId
            ? 'Quote'
            : 'Post';

    if (selfLoading || !self || (quotedTweetId && quotedLoading)) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    const quotedTweet: QuotedTweetPreview | null =
        quotedTweetId && quotedTweetData
            ? {
                id: quotedTweetData.tweet.id,
                username: quotedTweetData.tweet.username,
                content: quotedTweetData.tweet.content,
                imageUrl: quotedTweetData.tweet.imageUrl,
                createdAt: quotedTweetData.tweet.createdAt,
                profilePictureUrl: quotedTweetData.tweet.profilePictureUrl,
            }
            : null;

    return (
        <ThemedView style={styles.container}>
            <ScreenHeader
                title={primaryLabel}
                leftAction="back"
                onLeftPress={() => router.back()}
                rightAction={
                    <TouchableOpacity
                        onPress={() => setSubmitTrigger((x) => x + 1)}
                        disabled={!canSubmit || isPending}
                        style={[
                            styles.postBtn,
                            {
                                backgroundColor:
                                    canSubmit && !isPending ? '#1d9bf0' : '#1d9bf080',
                            },
                        ]}
                    >
                        {isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.postText}>{primaryLabel}</Text>
                        )}
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    style={styles.flex}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    <TweetForm
                        username={self.username}
                        profilePictureUrl={self.profilePicture}
                        parentId={parentId}
                        quotedTweetId={quotedTweetId}
                        quotedTweet={quotedTweet}
                        autoFocus
                        onSuccess={() => router.back()}
                        submitTrigger={submitTrigger}
                        onStateChange={(state) => {
                            setCanSubmit(state.canSubmit);
                            setIsPending(state.isPending);
                        }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    postBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        minWidth: 72,
        alignItems: 'center',
    },
    postText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    scrollContent: { flexGrow: 1 },
});