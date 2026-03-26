import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { ActiveTweetVideo } from "@/components/tweets/ActiveTweetVideo";

type TweetVideoMediaProps = {
  tweetId: number;
  videoUrl: string;
  borderColor: string;
  isActive: boolean;
  keepVideoPlayerWarm?: boolean;
  onOpenReels: () => void;
};

export function TweetVideoMedia({
  tweetId,
  videoUrl,
  borderColor,
  isActive,
  keepVideoPlayerWarm = false,
  onOpenReels,
}: TweetVideoMediaProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  const shouldShowPlayIcon = useMemo(
    () => isPausedByUser || (!isActive && !showToolbar),
    [isActive, isPausedByUser, showToolbar]
  );
  const shouldPlay = (isActive || showToolbar) && !isPausedByUser;

  const shouldMountPlayer =
    isActive || showToolbar || (keepVideoPlayerWarm && Boolean(thumbnailUrl));

  useEffect(() => {
    setShowToolbar(false);
    setIsPausedByUser(false);
  }, [tweetId]);

  useEffect(() => {
    if (isActive) return;
    setShowToolbar(false);
    setIsPausedByUser(false);
  }, [isActive]);

  useEffect(() => {
    let isCancelled = false;

    async function generateVideoPreview() {
      try {
        setIsThumbnailLoading(true);
        const result = await VideoThumbnails.getThumbnailAsync(videoUrl, {
          time: 1200,
        });
        if (!isCancelled) {
          setThumbnailUrl(result.uri);
        }
      } catch {
      } finally {
        if (!isCancelled) {
          setIsThumbnailLoading(false);
        }
      }
    }

    generateVideoPreview();

    return () => {
      isCancelled = true;
    };
  }, [tweetId, videoUrl]);

  return (
    <View style={[styles.tweetVideoWrap, { borderColor }]}>
      {shouldMountPlayer ? (
        <ActiveTweetVideo
          key={tweetId}
          videoUrl={videoUrl}
          isMuted={isMuted}
          shouldPlay={shouldPlay}
          previewUrl={thumbnailUrl}
        />
      ) : thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.previewImage} contentFit="cover" />
      ) : (
        <View style={styles.blackFallback} />
      )}
      {isThumbnailLoading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.previewSpinner} />
      ) : null}

      <Pressable
        style={styles.tapLayer}
        onPress={(e) => {
          e.stopPropagation?.();
          setShowToolbar(true);
        }}
        pointerEvents="auto"
        onStartShouldSetResponder={() => true}
      />

      {shouldShowPlayIcon ? (
        <MaterialIcons
          name="play-circle-filled"
          size={56}
          color="rgba(255,255,255,0.9)"
          style={styles.playIcon}
        />
      ) : null}

      {showToolbar ? (
        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              setIsPausedByUser((prev) => !prev);
            }}
            style={styles.toolbarButton}
          >
            <MaterialIcons
              name={isPausedByUser ? "play-arrow" : "pause"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              setIsMuted((prev) => !prev);
            }}
            style={styles.toolbarButton}
          >
            <MaterialIcons
              name={isMuted ? "volume-off" : "volume-up"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onOpenReels();
            }}
            style={styles.toolbarButton}
          >
            <MaterialIcons name="open-in-full" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              setShowToolbar(false);
            }}
            style={styles.toolbarButton}
          >
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tweetVideoWrap: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  blackFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  playIcon: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -28,
    zIndex: 3,
  },
  previewSpinner: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    marginTop: -42,
    zIndex: 3,
  },
  toolbar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 4,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
});
