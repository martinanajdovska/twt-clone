import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrGetConversation } from "@/api-calls/messages-api";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUsername: string) =>
      createOrGetConversation(otherUsername),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
    onError: (err: Error) => alert(err.message),
  });
};
