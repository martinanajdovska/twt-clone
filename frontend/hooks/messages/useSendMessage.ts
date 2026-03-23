import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api-calls/messages-api";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import type { IConversationListItem } from "@/DTO/IConversationListItem";
import { ISendMessagePayload } from "@/DTO/ISendMessagePayload";

type SendMessageContext = { blobUrl?: string; tempId?: number };

const REVOKE_BLOB_URL_AFTER_MS = 10_000;
function scheduleRevokeObjectURL(url?: string) {
  if (!url) return;
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_BLOB_URL_AFTER_MS);
}

export const useSendMessage = (conversationId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISendMessagePayload) =>
      sendMessage(conversationId!, payload),
    onMutate: async (payload): Promise<SendMessageContext> => {
      if (conversationId == null) return {};
      await queryClient.cancelQueries({
        queryKey: ["messages", "conversation", conversationId],
      });

      const blobUrl =
        payload.imageFile != null
          ? URL.createObjectURL(payload.imageFile)
          : undefined;
      const tempId = -Date.now();
      const tempMessage: IMessageResponse = {
        id: tempId,
        content: payload.content,
        createdAt: new Date().toISOString(),
        senderUsername: "",
        senderImageUrl: null,
        imageUrl: blobUrl ?? payload.gifUrl ?? null,
        optimisticImageUrl: blobUrl ?? null,
        gifUrl: payload.gifUrl ?? null,
      };

      queryClient.setQueryData<IMessageResponse[]>(
        ["messages", "conversation", conversationId],
        (old) => (old ? [...old, tempMessage] : [tempMessage]),
      );
      return { blobUrl, tempId };
    },
    onSuccess: (
      newMessage: IMessageResponse,
      _payload,
      context?: SendMessageContext,
    ) => {
      if (conversationId == null) return;
      const messageWithFallback: IMessageResponse =
        context?.blobUrl && newMessage.imageUrl !== context.blobUrl
          ? { ...newMessage, optimisticImageUrl: context.blobUrl }
          : newMessage;

      queryClient.setQueryData<IMessageResponse[]>(
        ["messages", "conversation", conversationId],
        (old) => {
          if (!old) return [messageWithFallback];
          if (context?.tempId != null) {
            const idx = old.findIndex((m) => m.id === context.tempId);
            if (idx !== -1) {
              const next = [...old];
              next[idx] = messageWithFallback;
              return next;
            }
          }
          const withoutTemp = old.filter((m) => m.id >= 0);
          return [...withoutTemp, messageWithFallback];
        },
      );
      queryClient.setQueryData<IConversationListItem[]>(
        ["messages", "conversations"],
        (old) =>
          old?.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    content: newMessage.content,
                    createdAt: newMessage.createdAt,
                    senderUsername: newMessage.senderUsername,
                  },
                  lastMessageAt: newMessage.createdAt,
                }
              : c,
          ) ?? old,
      );
      scheduleRevokeObjectURL(context?.blobUrl);
    },
    onError: (_err, _payload, context?: SendMessageContext) => {
      if (conversationId == null) return;
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversation", conversationId],
      });
      scheduleRevokeObjectURL(context?.blobUrl);
    },
  });
};
