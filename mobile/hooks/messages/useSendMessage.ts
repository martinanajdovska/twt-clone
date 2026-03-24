import { sendMessage } from "@/api/messages";
import { IMessageItem } from "@/types/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTempMessageToCache,
  replaceTempMessageInCache,
  updateConversationLastMessage,
} from "@/lib/cache-updates";

export const useSendMessage = (conversationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      content: string;
      imageUrl?: string | null;
      gifUrl?: string | null;
    }) =>
      sendMessage(conversationId, payload.content, {
        imageUrl: payload.imageUrl,
        gifUrl: payload.gifUrl,
      }),
    onMutate: async (payload) => {
      const tempMessage: IMessageItem = {
        id: -Date.now(),
        content: payload.content,
        createdAt: new Date().toISOString(),
        senderUsername: "",
        senderImageUrl: null,
        imageUrl: payload.imageUrl ?? null,
        gifUrl: payload.gifUrl ?? null,
      };

      addTempMessageToCache(queryClient, conversationId, tempMessage);
    },
    onSuccess: (newMessage) => {
      replaceTempMessageInCache(queryClient, conversationId, newMessage);
      updateConversationLastMessage(queryClient, conversationId, newMessage);
      // queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      // queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
};
