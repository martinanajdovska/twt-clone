import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { sendMessage } from "@/api-calls/messages-api";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import type { IConversationListItem } from "@/DTO/IConversationListItem";
import { ISendMessagePayload } from "@/DTO/ISendMessagePayload";
import type { MessagesPage } from "@/api-calls/messages-api";

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

      queryClient.setQueryData<InfiniteData<MessagesPage<IMessageResponse>>>(
        ["messages", "conversation", conversationId],
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  content: [tempMessage],
                  totalElements: 1,
                  size: 20,
                  number: 0,
                },
              ],
              pageParams: [0],
            };
          }
          const nextPages = old.pages.map((p, idx) =>
            idx === 0
              ? {
                  ...p,
                  content: [tempMessage, ...p.content],
                  totalElements: p.totalElements + 1,
                }
              : p,
          );
          return { ...old, pages: nextPages };
        },
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

      queryClient.setQueryData<InfiniteData<MessagesPage<IMessageResponse>>>(
        ["messages", "conversation", conversationId],
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  content: [messageWithFallback],
                  totalElements: 1,
                  size: 20,
                  number: 0,
                },
              ],
              pageParams: [0],
            };
          }
          const nextPages = old.pages.map((p) => {
            let replaced = false;
            const content = p.content.map((m) => {
              if (context?.tempId != null && m.id === context.tempId) {
                replaced = true;
                return messageWithFallback;
              }
              return m;
            });
            if (replaced) return { ...p, content };
            return p;
          });
          const didReplace = nextPages.some((p) =>
            p.content.some((m) => m.id === messageWithFallback.id),
          );
          if (!didReplace) {
            nextPages[0] = {
              ...nextPages[0],
              content: [
                messageWithFallback,
                ...nextPages[0].content.filter((m) => m.id >= 0),
              ],
            };
          }
          return {
            ...old,
            pages: nextPages,
          };
        },
      );
      queryClient.setQueryData<
        InfiniteData<MessagesPage<IConversationListItem>>
      >(["messages", "conversations"], (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                content: p.content.map((c) =>
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
                ),
              })),
            }
          : old,
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
