import { fetchProfileFeed } from "@/api/users";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useFetchProfileFeed(username: string, tab: string) {
  return useInfiniteQuery({
    queryKey: ["profile", username, tab],
    queryFn: ({ pageParam }) =>
      fetchProfileFeed(
        username || "",
        pageParam as number,
        tab as "tweets" | "replies" | "likes" | "media",
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) =>
      lastPage.length < 5 ? undefined : (lastParam as number) + 1,
    enabled: !!username,
  });
}
