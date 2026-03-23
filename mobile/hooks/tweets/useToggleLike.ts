import { toggleLike } from "@/api/tweets";
import { setTweetEngagementInAllCaches } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tweetId,
      isLiked,
    }: {
      tweetId: number;
      isLiked: boolean;
      likesCount: number;
    }) => toggleLike(tweetId, isLiked),
    onMutate: async ({ tweetId, isLiked, likesCount }) => {
      const next = !isLiked;
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isLiked: next,
        likesCount: Math.max(0, likesCount + (next ? 1 : -1)),
      });
    },
    onError: (_err, { tweetId, isLiked, likesCount }) => {
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isLiked,
        likesCount,
      });
    },
  });
}
