import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { ReelItem } from "@/components/reels/ReelItem";
import { useVideoTweetsForReels } from "@/hooks/tweets/useVideoTweetsForReels";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { initialTweetId } = useLocalSearchParams<{ initialTweetId?: string }>();

  const {
    tweets,
    initialIndex,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideoTweetsForReels(initialTweetId);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#1d9bf0" />
      </ThemedView>
    );
  }

  if (isError || !tweets.length) {
    return (
      <ThemedView style={styles.center}>
        <MaterialIcons name="videocam-off" size={48} color="#71767b" />
        <ThemedText style={styles.emptyText}>
          {tweets.length === 0
            ? "No video tweets yet."
            : "Failed to load videos."}
        </ThemedText>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backBtnText}>Go back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <MaterialIcons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <Carousel
        key={`carousel-${tweets.length}-${initialIndex}`}
        vertical
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        data={tweets}
        defaultIndex={initialIndex}
        loop={true}
        windowSize={3}
        onSnapToItem={(index) => {
          setActiveIndex(index);
          const shouldPrefetchMore = index >= tweets.length - 1;
          if (shouldPrefetchMore && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        renderItem={({ item, index }) => (
          <ReelItem
            tweet={item}
            isActive={index === activeIndex}
            shouldMountVideo={index === activeIndex}
            shouldGenerateThumbnail={Math.abs(index - activeIndex) <= 1}
          />
        )}
        style={styles.carousel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#1d9bf0",
    borderRadius: 24,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  carousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});
