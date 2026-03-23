import { fetchMessages } from "@/api/messages";
import { useQuery } from "@tanstack/react-query";

export const useFetchMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !isNaN(conversationId),
  });
};
