import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pinTweet, unpinTweet } from "@/api-calls/tweets-api";
import { updateTweetInAllCaches } from "@/lib/cache-updates";
import type { ITweetResponse } from "@/DTO/ITweetResponse";

export const usePinTweet = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      return isPinned ? await unpinTweet(id) : await pinTweet(id);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tweet", String(variables.id)] });
      const updater = (t: ITweetResponse) => ({ ...t, isPinned: !variables.isPinned });
      updateTweetInAllCaches(queryClient, variables.id, updater);
    },
    onSuccess: (updated: ITweetResponse) => {
      updateTweetInAllCaches(queryClient, updated.id, () => updated);
    },
    onError: (err, variables) => {
      const updater = (t: ITweetResponse) => ({ ...t, isPinned: variables.isPinned });
      updateTweetInAllCaches(queryClient, variables.id, updater);
      alert(err.message);
    },
  });
};
