import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";

type ActiveTweetVideoProps = {
  videoUrl: string;
  isMuted: boolean;
  shouldPlay: boolean;
  previewUrl: string | null;
};

function isPromiseVoid(value: unknown): value is Promise<void> {
  return typeof (value as Promise<void> | undefined)?.catch === "function";
}

export function ActiveTweetVideo({
  videoUrl,
  isMuted,
  shouldPlay,
  previewUrl,
}: ActiveTweetVideoProps) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(true);
  const [isFirstFrameRendered, setIsFirstFrameRendered] = useState(false);
  const hasRenderedFirstFrameRef = useRef(false);
  /** True if this play session began with no poster (feed video-only) */
  const startedPlayWithoutPreviewRef = useRef(false);
  const shouldPlayRef = useRef(shouldPlay);
  shouldPlayRef.current = shouldPlay;

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useLayoutEffect(() => {
    if (shouldPlay) {
      if (hasRenderedFirstFrameRef.current) {
        setShowPreviewOverlay(false);
      } else if (previewUrl) {
        setShowPreviewOverlay(true);
        setIsFirstFrameRendered(false);
      } else {
        startedPlayWithoutPreviewRef.current = true;
        setShowPreviewOverlay(false);
        setIsFirstFrameRendered(true);
      }

      let playResult: void | Promise<void>;

      try {
        playResult = player.play();
      } catch {
        return;
      }

      if (isPromiseVoid(playResult)) {
        playResult.catch(() => { });
      }
      return;
    }
    try {
      player.pause();
    } catch { }
    setShowPreviewOverlay(Boolean(previewUrl) && !hasRenderedFirstFrameRef.current);
  }, [shouldPlay, player, previewUrl]);

  useEffect(() => {
    hasRenderedFirstFrameRef.current = false;
    startedPlayWithoutPreviewRef.current = false;
    setIsFirstFrameRendered(false);
    setShowPreviewOverlay(true);
  }, [videoUrl]);

  useEffect(() => {
    if (!previewUrl) return;
    if (startedPlayWithoutPreviewRef.current) return;
    if (hasRenderedFirstFrameRef.current) return;
    if (!shouldPlay) return;
    setShowPreviewOverlay(true);
    setIsFirstFrameRendered(false);
  }, [previewUrl, shouldPlay]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: previewUrl && !isFirstFrameRendered ? 0 : 1,
          },
        ]}
        contentFit="cover"
        nativeControls={false}
        surfaceType="textureView"
        useExoShutter={false}
        onFirstFrameRender={() => {
          hasRenderedFirstFrameRef.current = true;
          setIsFirstFrameRendered(true);
          if (shouldPlayRef.current) {
            setShowPreviewOverlay(false);
          }
        }}
      />
      {showPreviewOverlay && previewUrl ? (
        <View style={styles.feedVideoPreviewWrap} pointerEvents="none">
          <Image source={{ uri: previewUrl }} style={styles.feedVideoPreviewImage} contentFit="cover" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  feedVideoPreviewWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  feedVideoPreviewImage: {
    ...StyleSheet.absoluteFillObject,
  },
});
