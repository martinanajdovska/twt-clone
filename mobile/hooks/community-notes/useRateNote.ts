import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rateNote } from "@/api/community-notes";
import { updateCommunityNoteRatingInCache } from "@/lib/cache-updates";

export function useRateNote(tweetId: number, noteId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isHelpful: boolean) => {
      return await rateNote(noteId, isHelpful);
    },
    onMutate: async (isHelpful) => {
      await queryClient.cancelQueries({ queryKey: ["tweet", String(tweetId)] });

      const previousTweetDetail = queryClient.getQueryData([
        "tweet",
        String(tweetId),
      ]);

      updateCommunityNoteRatingInCache(queryClient, tweetId, noteId, isHelpful);

      return { previousTweetDetail, isHelpful };
    },
    onError: (error, variables, context) => {
      if (context?.previousTweetDetail) {
        queryClient.setQueryData(
          ["tweet", String(tweetId)],
          context.previousTweetDetail,
        );
      }
    },
  });
}
