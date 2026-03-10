import { archiveConversation } from "@/api-calls/messages-api";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: archiveConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
      router.push("/messages");
    },
    onError: (err: Error) => alert(err.message),
  });
};
