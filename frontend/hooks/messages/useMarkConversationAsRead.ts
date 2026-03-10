import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api-calls/messages-api";

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) =>
      markConversationAsRead(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversation", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    },
  });
};
