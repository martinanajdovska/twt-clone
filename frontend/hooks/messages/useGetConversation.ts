import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "@/api-calls/messages-api";

export const useGetConversation = (conversationId: number | null) => {
  return useQuery({
    queryKey: ["messages", "conversation-detail", conversationId],
    queryFn: () => fetchConversation(conversationId!),
    enabled: conversationId != null,
  });
};
