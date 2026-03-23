import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTweetFromAllCaches } from "@/lib/cache-updates";
import { deleteTweet } from "@/api-calls/tweets-api";

export const useDeleteTweet = ({
  username,
  parentId,
}: {
  username: string;
  parentId?: number;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: number;
      username: string;
      parentId?: number;
    }) => deleteTweet(id),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["profile", username] });
      removeTweetFromAllCaches(queryClient, variables.id, username);
    },

    onSuccess: (_data, variables) => {
      if (parentId != null) {
        queryClient.setQueryData(
          ["tweet", String(parentId)],
          (old: unknown) => {
            if (!old || typeof old !== "object") return old;
            const data = old as { pages?: { replies?: { id: number }[] }[] };
            if (!data.pages?.length) return old;
            return {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                replies: (page.replies ?? []).filter(
                  (r) => r.id !== variables.id,
                ),
              })),
            };
          },
        );
      }
    },

    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      if (parentId != null) {
        queryClient.invalidateQueries({
          queryKey: ["tweet", String(parentId)],
        });
      }
      alert(err.message);
    },
  });
};
