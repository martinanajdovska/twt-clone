import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

type SaveImageResult = {
  ok: boolean;
  message?: string;
};

export async function saveImageToDevice(imageUrl: string): Promise<SaveImageResult> {
  if (!imageUrl) {
    return { ok: false, message: "Image URL is missing." };
  }

  if (Platform.OS === "web") {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = imageUrl.split("/").pop()?.split("?")[0] || `image-${Date.now()}.jpg`;

      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      return { ok: true };
    } catch {
      window.open(imageUrl, "_blank");
      return { ok: true };
    }
  }

  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    return { ok: false, message: "Please allow photo library access to save images." };
  }

  try {
    const filename = imageUrl.split("/").pop()?.split("?")[0] || `image-${Date.now()}.jpg`;
    const destination = `${FileSystem.cacheDirectory}${filename}`;

    const download = await FileSystem.downloadAsync(imageUrl, destination);
    await MediaLibrary.saveToLibraryAsync(download.uri);

    return { ok: true };
  } catch {
    return { ok: false, message: "Failed to save image." };
  }
}
