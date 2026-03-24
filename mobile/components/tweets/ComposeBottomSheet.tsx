import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { TweetForm, QuotedTweetPreview } from '@/components/tweets/TweetForm';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchTweetDetails } from '@/hooks/tweets/useFetchTweetDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';

interface ComposeBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    parentId?: number;
    quotedTweetId?: number;
    topOffset?: number;
}

export function ComposeBottomSheet({
    isVisible,
    onClose,
    parentId,
    quotedTweetId,
    topOffset = 0,
}: ComposeBottomSheetProps) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [canSubmit, setCanSubmit] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [submitTrigger, setSubmitTrigger] = useState(0);

    const { data: self, isLoading: selfLoading } = useFetchSelf();
    const { data: quotedTweetData, isLoading: quotedLoading } = useFetchTweetDetails(quotedTweetId);

    const sheetHeight = Math.max(1, windowHeight - topOffset);
    const snapPoints = useMemo(() => [sheetHeight], [sheetHeight]);

    const primaryLabel = parentId
        ? 'Reply'
        : quotedTweetId
            ? 'Quote'
            : 'Post';

    const handleClose = useCallback(() => {
        bottomSheetRef.current?.close();
        onClose();
    }, [onClose]);

    const handleSuccess = useCallback(() => {
        handleClose();
    }, [handleClose]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    if (!isVisible) return null;

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
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            topInset={0}
            enableDynamicSizing={false}
            enablePanDownToClose
            onClose={handleClose}
            backdropComponent={renderBackdrop}
            style={styles.sheet}
            backgroundStyle={{
                backgroundColor: isDark ? colors.background : '#fff',
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.text,
                opacity: 0.3,
            }}
        >
            <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
                <ScreenHeader
                    title={primaryLabel}
                    leftAction="back"
                    onLeftPress={handleClose}
                    style={styles.composeHeader}
                    rightAction={(
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
                    )}
                />

                {selfLoading || !self || (quotedTweetId && quotedLoading) ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.tint} />
                    </View>
                ) : (
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
                                onSuccess={handleSuccess}
                                submitTrigger={submitTrigger}
                                onStateChange={(state) => {
                                    setCanSubmit(state.canSubmit);
                                    setIsPending(state.isPending);
                                }}
                            />
                        </ScrollView>
                    </KeyboardAvoidingView>
                )}
            </BottomSheetView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    sheet: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    contentContainer: {
        flex: 1,
    },
    composeHeader: {
        paddingTop: 0,
    },
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
    flex: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { flexGrow: 1 },
});