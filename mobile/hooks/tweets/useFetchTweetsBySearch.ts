import { fetchTweetsBySearch } from "@/api/tweets";
import { useQuery } from "@tanstack/react-query";

export const useFetchTweetsBySearch = (debouncedQ: string) => {
  return useQuery({
    queryKey: ["search-tweets", debouncedQ],
    queryFn: () => fetchTweetsBySearch(debouncedQ),
    enabled: debouncedQ.length > 0,
  });
};
