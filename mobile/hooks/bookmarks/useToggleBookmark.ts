import { toggleBookmark } from "@/api/bookmarks";
import { setTweetEngagementInAllCaches } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tweetId,
      isBookmarked,
    }: {
      tweetId: number;
      isBookmarked: boolean;
      bookmarksCount: number;
    }) => toggleBookmark(tweetId, isBookmarked),
    onMutate: async ({ tweetId, isBookmarked, bookmarksCount }) => {
      const next = !isBookmarked;
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isBookmarked: next,
        bookmarksCount: Math.max(0, bookmarksCount + (next ? 1 : -1)),
      });
    },
    onError: (_err, { tweetId, isBookmarked, bookmarksCount }) => {
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isBookmarked,
        bookmarksCount,
      });
    },
  });
}
