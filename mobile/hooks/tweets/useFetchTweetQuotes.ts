import { fetchTweetQuotes } from "@/api/tweets";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useFetchTweetQuotes(tweetId: number) {
  return useInfiniteQuery({
    queryKey: ["tweet-quotes", tweetId],
    queryFn: ({ pageParam }) => fetchTweetQuotes(tweetId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) =>
      lastPage.length < 10 ? undefined : (lastParam as number) + 1,
    enabled: !isNaN(tweetId),
  });
}
