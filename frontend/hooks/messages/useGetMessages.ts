import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessages } from "@/api-calls/messages-api";

export const useGetMessages = (conversationId: number | null) => {
  return useInfiniteQuery({
    queryKey: ["messages", "conversation", conversationId],
    queryFn: ({ pageParam }) => fetchMessages(conversationId!, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.number + 1) * lastPage.size;
      return loaded >= lastPage.totalElements ? undefined : lastPage.number + 1;
    },
    enabled: conversationId != null,
  });
};
