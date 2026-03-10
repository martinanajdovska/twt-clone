import { useQuery } from "@tanstack/react-query";
import { fetchMessages } from "@/api-calls/messages-api";

export const useGetMessages = (conversationId: number | null) => {
  return useQuery({
    queryKey: ["messages", "conversation", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: conversationId != null,
  });
};
