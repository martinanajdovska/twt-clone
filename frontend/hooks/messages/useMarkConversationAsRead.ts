import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api-calls/messages-api";
import type { InfiniteData } from "@tanstack/react-query";
import type { IConversationListItem } from "@/DTO/IConversationListItem";
import type { MessagesPage } from "@/api-calls/messages-api";

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationAsRead,
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", "conversations"],
      });
      await queryClient.cancelQueries({
        queryKey: ["messages", "unread-count"],
      });
      const prev =
        queryClient.getQueryData<InfiniteData<MessagesPage<IConversationListItem>>>([
        "messages",
        "conversations",
      ]);
      const allConversations = prev?.pages.flatMap((p) => p.content) ?? [];
      const conv = allConversations.find((c) => c.id === conversationId);
      queryClient.setQueryData<InfiniteData<MessagesPage<IConversationListItem>>>(
        ["messages", "conversations"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  content: p.content.map((c) =>
                    c.id === conversationId
                      ? { ...c, hasUnread: false, unreadCount: 0 }
                      : c,
                  ),
                })),
              }
            : old,
      );
      if (conv?.hasUnread) {
        queryClient.setQueryData<number>(["messages", "unread-count"], (old) =>
          old != null ? Math.max(0, old - 1) : old,
        );
      }
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    },
  });
};
