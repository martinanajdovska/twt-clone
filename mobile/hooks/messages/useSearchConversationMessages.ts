import { searchConversationMessages } from "@/api/messages";
import { useQuery } from "@tanstack/react-query";

export const useSearchConversationMessages = (
  debouncedQ: string,
  otherUsername?: string,
  conversationId?: number,
) => {
  return useQuery({
    queryKey: [
      "conversation-messages-search",
      conversationId,
      otherUsername,
      debouncedQ,
    ],
    queryFn: () =>
      searchConversationMessages(debouncedQ, conversationId!, otherUsername!),
    enabled:
      debouncedQ.length > 0 &&
      Boolean(otherUsername) &&
      typeof conversationId === 'number' &&
      !Number.isNaN(conversationId),
  });
};
