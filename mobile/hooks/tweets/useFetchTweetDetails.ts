import { fetchTweetDetails } from "@/api/tweets";
import { useQuery } from "@tanstack/react-query";

export function useFetchTweetDetails(id?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["tweet", String(id)],
    queryFn: () => fetchTweetDetails(id!, 0),
    enabled: !!id && enabled,
  });
}
