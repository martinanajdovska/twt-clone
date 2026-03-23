import { updateProfileImage } from "@/api/users";
import { updateProfileImageInCache } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      return await updateProfileImage(imageUri);
    },
    onSuccess: (data) => {
      const username = queryClient.getQueryData<{
        username: string;
        profilePicture: string | null;
      }>(["self"])?.username;

      if (username && data.imageUrl) {
        updateProfileImageInCache(queryClient, username, data.imageUrl);
      }
    },
  });
}
