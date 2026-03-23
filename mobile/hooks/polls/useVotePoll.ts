import { votePoll } from "@/api/tweets";
import { updateTweetPollInAllCaches } from "@/lib/cache-updates";
import type { ITweet } from "@/types/tweet";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tweetId,
      optionId,
    }: {
      tweetId: number;
      optionId: number;
      poll: ITweet["poll"];
    }) => votePoll(tweetId, optionId),
    onMutate: async ({ tweetId, optionId, poll }) => {
      if (!poll) return;
      updateTweetPollInAllCaches(queryClient, tweetId, (old) =>
        old
          ? {
              ...old,
              selectedOptionId: optionId,
              options: old.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
              ),
            }
          : old,
      );
    },
    onError: (_err, { tweetId, poll }) => {
      updateTweetPollInAllCaches(queryClient, tweetId, poll);
    },
  });
}
