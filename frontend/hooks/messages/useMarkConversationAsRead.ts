import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api-calls/messages-api";
import type { IConversationListItem } from "@/DTO/IConversationListItem";

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
      const prev = queryClient.getQueryData<IConversationListItem[]>([
        "messages",
        "conversations",
      ]);
      const conv = prev?.find((c) => c.id === conversationId);
      queryClient.setQueryData<IConversationListItem[]>(
        ["messages", "conversations"],
        (old) =>
          old?.map((c) =>
            c.id === conversationId
              ? { ...c, hasUnread: false, unreadCount: 0 }
              : c,
          ) ?? old,
      );
      const unreadDelta = conv?.unreadCount ?? 0;
      if (unreadDelta > 0) {
        queryClient.setQueryData<number>(["messages", "unread-count"], (old) =>
          old != null ? Math.max(0, old - unreadDelta) : old,
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
