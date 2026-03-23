import { fetchConversation } from "@/api/messages";
import { useQuery } from "@tanstack/react-query";

export const useFetchConversationById = (conversationId: number) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => fetchConversation(conversationId),
    enabled: !isNaN(conversationId),
  });
};
