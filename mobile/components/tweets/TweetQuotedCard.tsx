import React from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ITweet } from "@/types/tweet";

type Props = {
  quotedTweet: ITweet["quotedTweet"];
  borderColor: string;
  quotedBg: string;
  textColor: string;
  mutedColor: string;
  disableAnimatedMedia?: boolean;
  onPress: () => void;
};

function isGifLikeUrl(url: string | null | undefined) {
  if (!url) return false;
  return /\.gif($|\?)/i.test(url);
}

export function TweetQuotedCard({
  quotedTweet,
  borderColor,
  quotedBg,
  textColor,
  mutedColor,
  disableAnimatedMedia = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.quoted, { borderColor, backgroundColor: quotedBg }]}
      onPress={onPress}
    >
      <View style={styles.quotedHeader}>
        <Text style={[styles.quotedName, { color: textColor }]}>
          {quotedTweet!.username}
        </Text>
        <Text style={[styles.quotedHandle, { color: mutedColor }]}>
          @{quotedTweet!.username.toLowerCase()}
        </Text>
      </View>

      {quotedTweet!.content ? (
        <Text style={[styles.quotedContent, { color: textColor }]} numberOfLines={3}>
          {quotedTweet!.content}
        </Text>
      ) : null}

      {quotedTweet!.imageUrl && (
        <Image
          source={{ uri: quotedTweet!.imageUrl }}
          style={styles.quotedImage}
          autoplay={!(disableAnimatedMedia && isGifLikeUrl(quotedTweet!.imageUrl))}
        />
      )}

      {quotedTweet!.gifUrl && !quotedTweet!.imageUrl && (
        <Image
          source={{ uri: quotedTweet!.gifUrl }}
          style={styles.quotedImage}
          autoplay={!disableAnimatedMedia}
        />
      )}

      {quotedTweet!.videoUrl && !quotedTweet!.imageUrl && !quotedTweet!.gifUrl && (
        <View style={styles.quotedVideoPlaceholder}>
          <MaterialIcons name="videocam" size={24} color={mutedColor} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  quoted: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  quotedHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  quotedName: { fontSize: 14, fontWeight: "700" },
  quotedHandle: { fontSize: 14 },
  quotedContent: { fontSize: 14, lineHeight: 18 },
  quotedImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quotedVideoPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
