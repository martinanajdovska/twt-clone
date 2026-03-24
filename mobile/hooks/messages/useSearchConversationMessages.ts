import { searchConversationMessages } from "@/api/messages";
import { useQuery } from "@tanstack/react-query";

export const useSearchConversationMessages = (
  debouncedQ: string,
  otherUsername?: string,
) => {
  return useQuery({
    queryKey: ["conversation-messages-search", otherUsername, debouncedQ],
    queryFn: () => searchConversationMessages(debouncedQ, otherUsername!),
    enabled: debouncedQ.length > 0 && Boolean(otherUsername),
  });
};
