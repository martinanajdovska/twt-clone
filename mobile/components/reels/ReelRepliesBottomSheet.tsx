import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeScrollEvent } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { ITweet } from "@/types/tweet";
import { TweetCard } from "@/components/tweets/TweetCard";
import { useFetchSelf } from "@/hooks/users/useFetchSelf";
import { usePaginatedTweetReplies } from "@/hooks/tweets/usePaginatedTweetReplies";
import TweetReplyInput from "@/components/tweets/TweetReplyInput";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  tweetId: number;
};

const SHEET_BOTTOM_OVERLAP_PX = 6;

export function ReelRepliesBottomSheet({ isVisible, onClose, tweetId }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = Dimensions.get("window");
  const snapPoints = useMemo(
    () => [Math.max(64, windowHeight * 0.1), Math.max(160, windowHeight * 0.6)],
    [windowHeight],
  );
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const { keyboardHeight } = useKeyboard();
  const { data: self } = useFetchSelf();

  const {
    replies,
    isLoadingReplies,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    resetPagination,
  } = usePaginatedTweetReplies({
    tweetId,
    enabled: isVisible,
    startPage: 0,
  });

  const handleSheetClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleSheetClose();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, handleSheetClose]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(128,128,128,0.25)",
          backgroundColor: isDark ? colors.background : "#fff",
        }}
      >
        <TweetReplyInput
          parentId={tweetId}
          onSubmitted={() => { }}
          placeholder="Post your reply"
        />
      </BottomSheetFooter>
    ),
    [insets.bottom, isDark, colors.background, tweetId],
  );

  useEffect(() => {
    resetPagination();
  }, [isVisible, resetPagination, tweetId]);

  if (!isVisible) return null;

  const keyboardOffset = Math.max(0, keyboardHeight);

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { bottom: keyboardOffset - SHEET_BOTTOM_OVERLAP_PX },
      ]}
      pointerEvents="box-none"
    >
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        bottomInset={0}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={handleSheetClose}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        style={styles.sheet}
        backgroundStyle={{
          backgroundColor: isDark ? colors.background : "#fff",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.icon,
          opacity: 0.4,
        }}
      >
        <BottomSheetFlatList
          style={styles.list}
          data={isLoadingReplies ? [] : replies}
          enableFooterMarginAdjustment
          keyExtractor={(item: ITweet) => String(item.id)}
          contentContainerStyle={{
            backgroundColor: isDark ? colors.background : "#fff",
            flexGrow: 1,
          }}
          renderItem={({ item }: { item: ITweet }) => (
            <View style={styles.replyItem}>
              <TweetCard
                tweet={item}
                currentUsername={self?.username ?? ""}
                showPinnedLabel={false}
                disableAnimatedMedia
              />
            </View>
          )}
          onScroll={({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const remaining =
              contentSize.height - (layoutMeasurement.height + contentOffset.y);
            const userHasScrolled = contentOffset.y > 0;
            if (remaining < 220 && userHasScrolled && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListEmptyComponent={
            isLoadingReplies ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={{ color: colors.icon }}>No replies yet.</Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null
          }
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    zIndex: 10,
  },
  list: {
    flex: 1,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  replyItem: {},
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
