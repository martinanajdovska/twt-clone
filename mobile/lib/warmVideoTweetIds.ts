import type { ITweet } from "@/types/tweet";

/**
 * Tweet ids that should keep the inline video player mounted: one row before the
 * active video, the active row, and two rows after (indices i-1 … i+2 in feed order).
 * Asymmetric (+2 below) preloads the next item that will become active when scrolling
 * down, reducing black flash without keeping the whole feed warm.
 */
export function warmVideoTweetIdsForFeed(
  tweets: ITweet[],
  activeVideoTweetId: number | null
): Set<number> {
  if (activeVideoTweetId == null) return new Set();
  const idx = tweets.findIndex(
    (t) => t.id === activeVideoTweetId && Boolean(t.videoUrl)
  );
  if (idx < 0) return new Set();
  const out = new Set<number>();
  for (const j of [idx - 1, idx, idx + 1, idx + 2]) {
    if (j < 0 || j >= tweets.length) continue;
    const t = tweets[j];
    if (t?.videoUrl) out.add(t.id);
  }
  return out;
}

export type ProfileVideoListItem =
  | { type: "header"; id: string }
  | { type: "tabs"; id: string }
  | { type: "tweet"; id: string; data: ITweet };

export function warmVideoTweetIdsForProfileList(
  listItems: ProfileVideoListItem[],
  activeVideoTweetId: number | null
): Set<number> {
  if (activeVideoTweetId == null) return new Set();
  const idx = listItems.findIndex(
    (item) =>
      item.type === "tweet" &&
      item.data.id === activeVideoTweetId &&
      Boolean(item.data.videoUrl)
  );
  if (idx < 0) return new Set();
  const out = new Set<number>();
  for (const j of [idx - 1, idx, idx + 1, idx + 2]) {
    if (j < 0 || j >= listItems.length) continue;
    const item = listItems[j];
    if (item?.type === "tweet" && item.data.videoUrl) {
      out.add(item.data.id);
    }
  }
  return out;
}
