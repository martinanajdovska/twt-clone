import { Alert, Platform } from "react-native";
import { useCallback } from "react";

type UseMediaPickerParams = {
  showPoll: boolean;
  setImageUrl: (v: string | null) => void;
  setVideoUrl: (v: string | null) => void;
  setGifUrl: (v: string | null) => void;
};

export const useMediaPicker = ({
  showPoll,
  setImageUrl,
  setVideoUrl,
  setGifUrl,
}: UseMediaPickerParams) => {
  const pickMedia = useCallback(
    async (type: "image" | "video") => {
      if (showPoll) return;

      if (Platform.OS === "web") {
        if (type === "image" || type === "video") {
          Alert.alert(
            "Image upload",
            "Image attachment is available in the iOS or Android app.",
          );
        }
        return;
      }

      const ImagePicker = require("expo-image-picker");

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          `Allow access to photos to attach a ${type}.`,
        );
        return;
      }

      const isImage = type === "image";

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: isImage ? ["images"] : ["videos"],
        allowsEditing: true,
        ...(isImage ? { aspect: [16, 9] } : { videoMaxDuration: 60 }),
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;

        setGifUrl(null);

        if (isImage) {
          setVideoUrl(null);
          setImageUrl(uri);
        } else {
          setImageUrl(null);
          setVideoUrl(uri);
        }
      }
    },
    [showPoll, setImageUrl, setVideoUrl, setGifUrl],
  );

  const pickImage = useCallback(() => pickMedia("image"), [pickMedia]);
  const pickVideo = useCallback(() => pickMedia("video"), [pickMedia]);

  return {
    pickImage,
    pickVideo,
  };
};
