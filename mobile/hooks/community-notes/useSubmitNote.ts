import { submitNote } from "@/api/community-notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSubmitNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tweetId, content }: { tweetId: number; content: string }) =>
      submitNote(tweetId, content),
    onSuccess: (_data, { tweetId }) => {
      queryClient.setQueryData(
        ["community-notes", "all", tweetId],
        (old: unknown) => old,
      );
      queryClient.invalidateQueries({ queryKey: ["community-notes"] });
    },
  });
}
