import { archiveConversation } from "@/api-calls/messages-api";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IConversationListItem } from "@/DTO/IConversationListItem";

export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: archiveConversation,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", "conversations"],
      });
      queryClient.setQueryData<IConversationListItem[]>(
        ["messages", "conversations"],
        (old) => (old ? old.filter((c) => c.id !== id) : old)
      );
    },
    onSuccess: () => {
      router.push("/messages");
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
      alert(err.message);
    },
  });
};
