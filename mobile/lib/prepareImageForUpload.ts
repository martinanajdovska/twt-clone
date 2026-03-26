import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Image } from "react-native";

const MAX_EDGE = 2048;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject,
    );
  });
}

/**
 * Downscale and JPEG-compress library photos before multipart upload to reduce size and avoid
 * intermittent RN fetch failures on large payloads.
 */
export async function prepareImageForUpload(uri: string): Promise<string> {
  try {
    const { width, height } = await getImageSize(uri);
    const maxSide = Math.max(width, height);
    const actions =
      maxSide > MAX_EDGE
        ? (() => {
            const scale = MAX_EDGE / maxSide;
            return [
              {
                resize: {
                  width: Math.round(width * scale),
                  height: Math.round(height * scale),
                },
              },
            ];
          })()
        : [];

    const result = await manipulateAsync(uri, actions, {
      compress: 0.82,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}
