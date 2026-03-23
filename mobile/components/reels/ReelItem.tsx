import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ITweet } from "@/types/tweet";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToggleLike } from "@/hooks/tweets/useToggleLike";
import { useToggleRetweet } from "@/hooks/tweets/useToggleRetweet";
import { useToggleBookmark } from "@/hooks/bookmarks/useToggleBookmark";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function ReelItem({
  tweet,
  isActive,
  shouldMountVideo,
}: {
  tweet: ITweet;
  isActive: boolean;
  shouldMountVideo: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const textColor = colors.text;
  const mutedColor = colors.icon;

  const { mutate: toggleLikeMutation, isPending: isLikePending } = useToggleLike();
  const { mutate: toggleRetweetMutation, isPending: isRetweetPending } =
    useToggleRetweet();
  const { mutate: toggleBookmarkMutation, isPending: isBookmarkPending } =
    useToggleBookmark();

  const handleLike = () => {
    toggleLikeMutation({
      tweetId: tweet.id,
      isLiked: tweet.isLiked,
      likesCount: tweet.likesCount,
    });
  }

  const handleRetweet = () => {
    toggleRetweetMutation({
      tweetId: tweet.id,
      isRetweeted: tweet.isRetweeted,
      retweetsCount: tweet.retweetsCount,
    });
  }

  const handleBookmark = () => {
    toggleBookmarkMutation({
      tweetId: tweet.id,
      isBookmarked: tweet.isBookmarked,
      bookmarksCount: tweet.bookmarksCount,
    });
  }

  if (!tweet.videoUrl) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Text style={{ color: mutedColor }}>Invalid video</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={[styles.placeholder, { backgroundColor: "#000" }]}>
          <MaterialIcons name="videocam-off" size={48} color={mutedColor} />
          <Text style={{ color: mutedColor, marginTop: 8 }}>Video plays in native app</Text>
        </View>
      ) : !shouldMountVideo ? (
        <View style={[styles.placeholder, { backgroundColor: "#000" }]}>
          <MaterialIcons name="play-circle-filled" size={56} color="rgba(255,255,255,0.85)" />
        </View>
      ) : (
        <ActiveVideo videoUrl={tweet.videoUrl} isActive={isActive} />
      )}

      {/* overlay: user + content + actions */}
      <View style={[styles.overlay, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomRow}>
          <View style={styles.leftCol}>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/users/${tweet.username}`)}
              style={styles.userRow}
            >
              <Text style={[styles.handle, { color: textColor }]} numberOfLines={1}>
                @{tweet.username}
              </Text>
            </TouchableOpacity>
            {tweet.content ? (
              <Text
                style={[styles.content, { color: textColor }]}
                numberOfLines={2}
              >
                {tweet.content}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsCol}>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.actionBtn}
              disabled={isLikePending}
            >
              <MaterialIcons
                name={tweet.isLiked ? "favorite" : "favorite-border"}
                size={28}
                color={tweet.isLiked ? "#f91880" : "#fff"}
              />
              <Text style={styles.actionCount}>
                {tweet.likesCount > 0 ? tweet.likesCount : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/tweets/${tweet.id}`)}
              style={styles.actionBtn}
            >
              <MaterialIcons name="chat-bubble-outline" size={26} color="#fff" />
              <Text style={styles.actionCount}>{tweet.repliesCount > 0 ? tweet.repliesCount : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRetweet}
              style={styles.actionBtn}
              disabled={isRetweetPending}
            >
              <MaterialIcons
                name="repeat"
                size={26}
                color={tweet.isRetweeted ? "#00ba7c" : "#fff"}
              />
              <Text style={styles.actionCount}>
                {tweet.retweetsCount > 0 ? tweet.retweetsCount : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBookmark}
              style={styles.actionBtn}
              disabled={isBookmarkPending}
            >
              <MaterialIcons
                name={tweet.isBookmarked ? "bookmark" : "bookmark-border"}
                size={26}
                color={tweet.isBookmarked ? "#1d9bf0" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function ActiveVideo({
  videoUrl,
  isActive,
}: {
  videoUrl: string | null;
  isActive: boolean;
}) {
  const player = useVideoPlayer(videoUrl!, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (!videoUrl) return;
    if (isActive) player.play();
    else player.pause();
  }, [isActive, videoUrl, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  leftCol: { flex: 1, minWidth: 0, marginRight: 12 },
  userRow: { marginBottom: 4 },
  handle: { fontSize: 15, fontWeight: "700" },
  content: { fontSize: 14, lineHeight: 20 },
  actionsCol: {
    alignItems: "center",
    gap: 16,
  },
  actionBtn: { alignItems: "center" },
  actionCount: { color: "#fff", fontSize: 12, marginTop: 2 },
});
