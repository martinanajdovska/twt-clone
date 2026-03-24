import { fetchConversations } from "@/api/messages";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useFetchConversations() {
  return useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: ({ pageParam }) => fetchConversations(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) => {
      const page = Array.isArray(lastPage) ? lastPage : [];
      return page.length < 10 ? undefined : (lastParam as number) + 1;
    },
  });
}
