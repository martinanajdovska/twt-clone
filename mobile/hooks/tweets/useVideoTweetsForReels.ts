import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideoTweets } from "@/api/tweets";
import type { ITweet, IVideoTweetsResponse } from "@/types/tweet";

export function useVideoTweetsForReels(initialTweetId?: string) {
  const query = useInfiniteQuery<IVideoTweetsResponse>({
    queryKey: ["reels-videos"],
    queryFn: ({ pageParam }) => fetchVideoTweets(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const content = Array.isArray(lastPage?.content) ? lastPage.content : [];
      const size = typeof lastPage?.size === "number" ? lastPage.size : content.length;
      if (!content.length || content.length < size) {
        return undefined;
      }
      const currentPage = typeof lastPage?.page === "number" ? lastPage.page : 0;
      return currentPage + 1;
    },
  });

  const tweets = query.data?.pages.flatMap((page) => page.content) ?? [];

  const initialIndex =
    initialTweetId != null && initialTweetId !== ""
      ? tweets.findIndex((t) => String(t.id) === initialTweetId)
      : 0;

  const safeInitialIndex = initialIndex >= 0 ? initialIndex : 0;

  return {
    ...query,
    tweets,
    initialIndex: safeInitialIndex,
  };
}
