import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IProfileHeader } from "@/DTO/IProfileHeader";
import { toggleFollow } from "@/api-calls/users-api";

export const useFollow = ({
  username,
}: {
  username: string;
  token?: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      isFollowed,
    }: {
      username: string;
      isFollowed: boolean;
    }) => toggleFollow(username, isFollowed),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["profileHeader", username],
      });
      queryClient.setQueryData<IProfileHeader>(
        ["profileHeader", username],
        (old) => {
          if (!old) return old;
          const delta = variables.isFollowed ? -1 : 1;
          return {
            ...old,
            isFollowed: !variables.isFollowed,
            followers: Math.max(0, old.followers + delta),
          };
        },
      );
    },

    onError: (err, variables) => {
      queryClient.setQueryData<IProfileHeader>(
        ["profileHeader", username],
        (old) => {
          if (!old) return old;
          const delta = variables.isFollowed ? 1 : -1;
          return {
            ...old,
            isFollowed: variables.isFollowed,
            followers: Math.max(0, old.followers + delta),
          };
        },
      );
      alert(err.message);
    },
  });
};
