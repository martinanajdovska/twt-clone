import { fetchMessages } from "@/api/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import { IMessagePage } from "@/types/message";

export const useFetchMessages = (conversationId: number) => {
  return useInfiniteQuery<IMessagePage>({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.number + 1) * lastPage.size;
      return loaded >= lastPage.totalElements ? undefined : lastPage.number + 1;
    },
    enabled: !isNaN(conversationId),
  });
};
