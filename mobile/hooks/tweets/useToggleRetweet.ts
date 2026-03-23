import { toggleRetweet } from "@/api/tweets";
import { setTweetEngagementInAllCaches } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleRetweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tweetId,
      isRetweeted,
    }: {
      tweetId: number;
      isRetweeted: boolean;
      retweetsCount: number;
    }) => toggleRetweet(tweetId, isRetweeted),
    onMutate: async ({ tweetId, isRetweeted, retweetsCount }) => {
      const next = !isRetweeted;
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isRetweeted: next,
        retweetsCount: Math.max(0, retweetsCount + (next ? 1 : -1)),
      });
    },
    onError: (_err, { tweetId, isRetweeted, retweetsCount }) => {
      setTweetEngagementInAllCaches(queryClient, tweetId, {
        isRetweeted,
        retweetsCount,
      });
    },
  });
}
