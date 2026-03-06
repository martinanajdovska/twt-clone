"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/constants";
import type { ITweetResponse } from "@/DTO/ITweetResponse";

export const useVotePoll = (tweetId: number, username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionId: number) => {
      const res = await fetch(`${BASE_URL}/api/tweets/${tweetId}/poll/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      return res.json() as Promise<ITweetResponse["poll"]>;
    },
    onSuccess: (updatedPoll) => {
      queryClient.setQueriesData<ITweetResponse>(
        { queryKey: ["tweet", tweetId.toString()] },
        (old) => (old ? { ...old, poll: updatedPoll } : old),
      );
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });
};
