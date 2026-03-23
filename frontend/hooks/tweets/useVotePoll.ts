"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTweetPollInAllCaches } from "@/lib/cache-updates";
import { votePoll } from "@/api-calls/tweets-api";

export const useVotePoll = (tweetId: number, username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionId: number) => votePoll(tweetId, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({
        queryKey: ["tweet", tweetId.toString()],
      });
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
    onSuccess: (updatedPoll) => {
      updateTweetPollInAllCaches(queryClient, tweetId, updatedPoll);
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });
};
