import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTweetInAllCaches } from "@/lib/cache-updates";
import type { ITweetResponse } from "@/DTO/ITweetResponse";
import { toggleBookmark } from "@/api-calls/bookmarks-api";

export const useBookmarkTweet = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isBookmarked,
    }: {
      id: number;
      isBookmarked: boolean;
    }) => toggleBookmark(id, isBookmarked),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["tweet", String(variables.id)],
      });
      const updater = (t: ITweetResponse) => ({
        ...t,
        isBookmarked: !variables.isBookmarked,
        bookmarksCount: t.bookmarksCount + (variables.isBookmarked ? -1 : 1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
    },
    onError: (err, variables) => {
      const updater = (t: ITweetResponse) => ({
        ...t,
        isBookmarked: variables.isBookmarked,
        bookmarksCount: t.bookmarksCount + (variables.isBookmarked ? 1 : -1),
      });
      updateTweetInAllCaches(queryClient, variables.id, updater);
      alert(err.message);
    },
  });
};
