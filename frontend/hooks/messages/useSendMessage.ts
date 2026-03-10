import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api-calls/messages-api";
import { IMessageResponse } from "@/DTO/IMessageResponse";

export const useSendMessage = (conversationId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId!, content),
    onSuccess: (newMessage: IMessageResponse) => {
      if (conversationId == null) return;
      const queryKey = ["messages", "conversation", conversationId] as const;
      queryClient.setQueryData<IMessageResponse[]>(queryKey, (old) =>
        old ? [...old, newMessage] : [newMessage],
      );
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
};
