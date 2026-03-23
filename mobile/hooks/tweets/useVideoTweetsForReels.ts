import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideoTweets } from "@/api/tweets";
import type { ITweet, IVideoTweetsResponse } from "@/types/tweet";

export function useVideoTweetsForReels(initialTweetId?: string) {
  const query = useInfiniteQuery<IVideoTweetsResponse>({
    queryKey: ["reels-videos"],
    queryFn: ({ pageParam }) => fetchVideoTweets(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.content.length || lastPage.content.length < lastPage.size) {
        return undefined;
      }
      const lastTweet = lastPage.content[lastPage.content.length - 1];
      return lastTweet?.id;
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
