import { fetchTweets } from "@/api/tweets";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFetchProfileFeed } from "../users/useFetchProfileFeed";

export default function useFetchTweets(queryKey: string[]) {
  if (queryKey[0] === "profile") {
    return useFetchProfileFeed(
      queryKey[1],
      queryKey[2] as "tweets" | "likes" | "replies" | "media",
    );
  }
  return useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      if (queryKey[0] === "feed") {
        return fetchTweets(pageParam as number);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) =>
      !lastPage || lastPage.length < 5 ? undefined : (lastParam as number) + 1,
  });
}
