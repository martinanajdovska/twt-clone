import { toggleFollow } from "@/api/users";
import { setProfileFollowStateInCache } from "@/lib/cache-updates";
import type { IProfileHeader } from "@/types/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { username: string; isFollowed: boolean },
    { username: string; previous: IProfileHeader | undefined }
  >({
    mutationFn: ({ username, isFollowed }) =>
      toggleFollow(username, isFollowed),
    onMutate: async ({ username, isFollowed }) => {
      await queryClient.cancelQueries({
        queryKey: ["profileHeader", username],
      });

      const previous = queryClient.getQueryData<IProfileHeader>([
        "profileHeader",
        username,
      ]);
      const next = !isFollowed;
      setProfileFollowStateInCache(queryClient, username, next);
      return { username, previous };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(
        ["profileHeader", context.username],
        context.previous,
      );
    },
  });
}
