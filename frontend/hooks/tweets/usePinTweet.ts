import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pinTweet, unpinTweet } from "@/api-calls/tweets-api";

export const usePinTweet = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      return isPinned ? await unpinTweet(id) : await pinTweet(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["tweet", variables.id.toString()] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });
};

