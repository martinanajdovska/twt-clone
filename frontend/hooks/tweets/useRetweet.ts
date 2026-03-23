import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTweetInAllCaches } from "@/lib/cache-updates";
import type { ITweetResponse } from "@/DTO/ITweetResponse";
import { toggleRetweet } from "@/api-calls/tweets-api";

export const useRetweet = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isRetweeted,
    }: {
      id: number;
      isRetweeted: boolean;
    }) => toggleRetweet(id, isRetweeted),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["tweet", String(variables.id)],
      });
      const updater = (t: ITweetResponse) => ({
        ...t,
        isRetweeted: !variables.isRetweeted,
        retweetsCount: t.retweetsCount + (variables.isRetweeted ? -1 : 1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
    },
    onError: (err, variables) => {
      const updater = (t: ITweetResponse) => ({
        ...t,
        isRetweeted: variables.isRetweeted,
        retweetsCount: t.retweetsCount + (variables.isRetweeted ? 1 : -1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
      alert(err.message);
    },
  });
};
