import type { ITweet } from "@/types/tweet";

/**
 * Coerce ids and engagement flags so toggles use the same semantics as the API
 * (avoids duplicate POST → unique constraint 500 when flags were wrong/undefined).
 */
export function normalizeTweet(t: ITweet): ITweet {
  return {
    ...t,
    id: Number(t.id),
    isLiked: t.isLiked === true,
    isRetweeted: t.isRetweeted === true,
    isBookmarked: t.isBookmarked === true,
  };
}
