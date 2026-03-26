import { useCallback, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTweetDetails } from "@/api/tweets";
import { appendRepliesToTweetDetailCache } from "@/lib/cache-updates";
import type { ITweetDetailsResponse } from "@/types/tweet";

type UsePaginatedTweetRepliesParams = {
  tweetId: number;
  initialRepliesCount?: number;
  pageSize?: number;
};

export function usePaginatedTweetReplies({
  tweetId,
  initialRepliesCount,
}: UsePaginatedTweetRepliesParams) {
  const queryClient = useQueryClient();
  const effectiveRepliesPageSize = 10;

  const resetPagination = useCallback(() => {
    queryClient.removeQueries({
      queryKey: ["tweet-replies", tweetId],
      exact: true,
    });
  }, [queryClient, tweetId]);

  const query = useInfiniteQuery<ITweetDetailsResponse>({
    queryKey: ["tweet-replies", tweetId],
    queryFn: ({ pageParam }) =>
      fetchTweetDetails(tweetId, pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastParam) => {
      const page = Array.isArray(lastPage?.replies) ? lastPage.replies : [];
      if (page.length === 0 || page.length < effectiveRepliesPageSize) {
        return undefined;
      }
      return (lastParam as number) + 1;
    },
    enabled:
      !Number.isNaN(tweetId) && Boolean(tweetId) && initialRepliesCount !== 0,
  });

  useEffect(() => {
    if (!query.data?.pages?.length) return;
    query.data.pages.forEach((details) => {
      appendRepliesToTweetDetailCache(queryClient, tweetId, details);
    });
  }, [query.data, queryClient, tweetId]);

  const loadMoreReplies = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  }, [query]);

  return {
    hasMoreReplies: Boolean(query.hasNextPage),
    isFetchingMoreReplies: query.isFetchingNextPage,
    loadMoreReplies,
    resetPagination,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
