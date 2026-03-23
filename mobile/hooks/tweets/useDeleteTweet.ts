import { deleteTweet } from "@/api/tweets";
import { removeTweetFromAllCaches } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tweetId }: { tweetId: number; username: string }) =>
      deleteTweet(tweetId),
    onMutate: async ({ tweetId, username }) => {
      removeTweetFromAllCaches(queryClient, tweetId, username);
    },
    onError: (_err, { tweetId }) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["tweet", String(tweetId)] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["reels-videos"] });
    },
  });
}
