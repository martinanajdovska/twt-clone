import { fetchTweetDetails } from "@/api/tweets";
import { useQuery } from "@tanstack/react-query";

export function useFetchTweetDetails(id?: number) {
  return useQuery({
    queryKey: ["tweet", id],
    queryFn: () => fetchTweetDetails(id!, 0),
    enabled: !!id,
  });
}
