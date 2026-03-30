import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { createOrGetConversation } from "@/api-calls/messages-api";
import type { IConversationListItem } from "@/DTO/IConversationListItem";
import type { MessagesPage } from "@/api-calls/messages-api";

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
      queryClient.setQueryData<InfiniteData<MessagesPage<IConversationListItem>>>(
        ["messages", "conversations"],
        (old) => {
          if (!old) {
            return {
              pages: [
                { content: [newItem], totalElements: 1, size: 10, number: 0 },
              ],
              pageParams: [0],
            };
          }
          const first = old.pages[0];
          const rest = old.pages.slice(1);
          const without = first.content.filter((c) => c.id !== data.id);
          return {
            ...old,
            pages: [
              {
                ...first,
                content: [newItem, ...without],
                totalElements: Math.max(first.totalElements, without.length + 1),
              },
              ...rest,
            ],
          };
        },
      );
    },
    onError: (err: Error) => alert(err.message),
  });
};
