import { archiveConversation } from "@/api/messages";
import { removeConversationFromCache } from "@/lib/cache-updates";
import type { InfiniteData } from "@tanstack/react-query";
import type { IConversationListItem } from "@/types/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useArchiveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveConversation,
    onMutate: async (conversationId: number) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      const previous = queryClient.getQueryData<
        InfiniteData<IConversationListItem[]>
      >(["conversations"]);

      removeConversationFromCache(queryClient, conversationId);

      return { previous };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["conversations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
