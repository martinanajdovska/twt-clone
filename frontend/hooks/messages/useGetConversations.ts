import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/api-calls/messages-api";

export const useGetConversations = () => {
  return useInfiniteQuery({
    queryKey: ["messages", "conversations"],
    queryFn: ({ pageParam }) => fetchConversations(pageParam as number, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.number + 1) * lastPage.size;
      return loaded >= lastPage.totalElements ? undefined : lastPage.number + 1;
    },
  });
};
