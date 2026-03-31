import type { ITweet } from "@/types/tweet";

export function normalizeTweet(t: ITweet): ITweet {
  return {
    ...t,
    id: Number(t.id),
    isLiked: t.isLiked === true,
    isRetweeted: t.isRetweeted === true,
    isBookmarked: t.isBookmarked === true,
  };
}
