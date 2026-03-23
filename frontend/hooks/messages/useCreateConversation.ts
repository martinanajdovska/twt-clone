import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrGetConversation } from "@/api-calls/messages-api";
import type { IConversationListItem } from "@/DTO/IConversationListItem";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUsername: string) =>
      createOrGetConversation(otherUsername),
    onSuccess: (data) => {
      const newItem: IConversationListItem = {
        ...data,
        lastMessage: null,
        lastMessageAt: null,
        hasUnread: false,
        unreadCount: 0,
      };
      queryClient.setQueryData<IConversationListItem[]>(
        ["messages", "conversations"],
        (old) => {
          if (!old) return [newItem];
          const without = old.filter((c) => c.id !== data.id);
          return [newItem, ...without];
        }
      );
    },
    onError: (err: Error) => alert(err.message),
  });
};
