import { pinTweet, unpinTweet } from "@/api/tweets";
import { updateTweetInAllCaches } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePinTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tweetId,
      isPinned,
    }: {
      tweetId: number;
      isPinned: boolean;
    }) => {
      if (isPinned) {
        return unpinTweet(tweetId);
      }
      return pinTweet(tweetId);
    },
    onMutate: async ({ tweetId, isPinned }) => {
      const next = !isPinned;
      updateTweetInAllCaches(queryClient, tweetId, (t) => ({
        ...t,
        isPinned: next,
      }));
    },
    onError: (_err, { tweetId, isPinned }) => {
      updateTweetInAllCaches(queryClient, tweetId, (t) => ({
        ...t,
        isPinned,
      }));
    },
  });
}
