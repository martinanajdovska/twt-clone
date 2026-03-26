import { sendMessage } from "@/api/messages";
import { IMessageItem } from "@/types/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTempMessageToCache,
  removeTempMessageFromCache,
  replaceTempMessageInCache,
  updateConversationLastMessage,
} from "@/lib/cache-updates";

type SelfCache = {
  username: string;
  profilePicture: string | null;
  displayName: string | null;
};

let pendingMessageTempId = 0;
function nextPendingMessageId(): number {
  return --pendingMessageTempId;
}

export const useSendMessage = (conversationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      content: string;
      imageUrl?: string | null;
      imageMimeType?: string | null;
      gifUrl?: string | null;
    }) =>
      sendMessage(conversationId, payload.content, {
        imageUrl: payload.imageUrl,
        imageMimeType: payload.imageMimeType,
        gifUrl: payload.gifUrl,
      }),
    onMutate: async (payload) => {
      const self = queryClient.getQueryData<SelfCache>(["self"]);
      const tempId = nextPendingMessageId();
      const tempMessage: IMessageItem = {
        id: tempId,
        content: payload.content,
        createdAt: new Date().toISOString(),
        senderUsername: self?.username ?? "",
        senderImageUrl: self?.profilePicture ?? null,
        imageUrl: payload.imageUrl ?? null,
        gifUrl: payload.gifUrl ?? null,
      };

      addTempMessageToCache(queryClient, conversationId, tempMessage);
      return { tempId };
    },
    onSuccess: (newMessage, _variables, context) => {
      if (context?.tempId != null) {
        replaceTempMessageInCache(
          queryClient,
          conversationId,
          newMessage,
          context.tempId,
        );
      }
      updateConversationLastMessage(queryClient, conversationId, newMessage);
    },
    onError: (_err, _variables, context) => {
      if (context?.tempId != null) {
        removeTempMessageFromCache(
          queryClient,
          conversationId,
          context.tempId,
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      }
    },
  });
};
