import { Platform } from "react-native";

type SaveImageResult = {
  ok: boolean;
  message?: string;
};

export async function saveImageOnWebOnly(imageUrl: string): Promise<SaveImageResult> {
  if (!imageUrl) {
    return { ok: false, message: "Image URL is missing." };
  }

  if (Platform.OS !== "web") {
    return {
      ok: false,
      message: "Save is temporarily available on web only.",
    };
  }

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
