import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ITweet } from "@/types/tweet";
import { useCompose } from "@/contexts/ComposeContext";
import { Share } from "react-native";
import { FRONTEND_URL } from "@/lib/constants";


type Props = {
  tweet: ITweet;
  iconColor: string;
  mutedColor: string;
  onRetweetPress: (e: { stopPropagation?: () => void }) => void;
  onLikePress: (e: { stopPropagation?: () => void }) => void;
  onBookmarkPress: (e: { stopPropagation?: () => void }) => void;
  showCounts: boolean;
  onReplyPress?: () => void;
};

export function TweetActions({
  tweet,
  iconColor,
  mutedColor,
  onRetweetPress,
  onLikePress,
  onBookmarkPress,
  showCounts,
  onReplyPress,
}: Props) {
  const { openCompose } = useCompose();

  const handleSharePress = async () => {
    try {
      const webTweetUrl = `${FRONTEND_URL}/tweets/${tweet.id}`;

      await Share.share({
        message: webTweetUrl,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share tweet");
    }
  };

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() => {
          if (onReplyPress) {
            onReplyPress();
          } else {
            openCompose({ parentId: tweet.id });
          }
        }}
        style={styles.actionBtn}
        hitSlop={8}
      >
        <MaterialIcons name="chat-bubble-outline" size={18} color={iconColor} />
        {showCounts && tweet.repliesCount > 0 && (
          <Text style={[styles.actionCount, { color: mutedColor }]}>
            {tweet.repliesCount}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onRetweetPress} style={styles.actionBtn} hitSlop={8}>
        <MaterialIcons
          name="repeat"
          size={20}
          color={tweet.isRetweeted ? "#00ba7c" : iconColor}
        />
        {showCounts && tweet.retweetsCount > 0 && (
          <Text
            style={[
              styles.actionCount,
              { color: tweet.isRetweeted ? "#00ba7c" : mutedColor },
            ]}
          >
            {tweet.retweetsCount}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onLikePress} style={styles.actionBtn} hitSlop={8}>
        <MaterialIcons
          name={tweet.isLiked ? "favorite" : "favorite-border"}
          size={18}
          color={tweet.isLiked ? "#f91880" : iconColor}
        />
        {showCounts && tweet.likesCount > 0 && (
          <Text
            style={[styles.actionCount, { color: tweet.isLiked ? "#f91880" : mutedColor }]}
          >
            {tweet.likesCount}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onBookmarkPress} style={styles.actionBtn} hitSlop={8}>
        <MaterialIcons
          name={tweet.isBookmarked ? "bookmark" : "bookmark-border"}
          size={18}
          color={tweet.isBookmarked ? "#1d9bf0" : iconColor}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSharePress} style={styles.actionBtn} hitSlop={8}>
        <MaterialIcons name="share" size={18} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginRight: 16,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 40 },
  actionCount: { fontSize: 13 },
});
