import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTweetInAllCaches } from "@/lib/cache-updates";
import type { ITweetResponse } from "@/DTO/ITweetResponse";
import { toggleLike } from "@/api-calls/tweets-api";

export const useLikeTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isLiked }: { id: number; isLiked: boolean }) =>
      toggleLike(id, isLiked),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["tweet", String(variables.id)],
      });
      const updater = (t: ITweetResponse) => ({
        ...t,
        isLiked: !variables.isLiked,
        likesCount: t.likesCount + (variables.isLiked ? -1 : 1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
    },

    onError: (err, variables) => {
      const updater = (t: ITweetResponse) => ({
        ...t,
        isLiked: variables.isLiked,
        likesCount: t.likesCount + (variables.isLiked ? 1 : -1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
      alert(err.message);
    },
  });
};
