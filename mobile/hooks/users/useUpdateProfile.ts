import { updateProfile } from "@/api/users";
import { updateProfileDataInCache } from "@/lib/cache-updates";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateProfile(formData);
    },
    onSuccess: (data) => {
      const username = queryClient.getQueryData<{
        username: string;
        profilePicture: string | null;
      }>(["self"])?.username;

      if (username) {
        updateProfileDataInCache(queryClient, username, data);
      }
    },
  });
}
