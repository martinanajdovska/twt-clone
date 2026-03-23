import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IProfileHeader } from "@/DTO/IProfileHeader";
import { updateProfileImage } from "@/api-calls/users-api";

export const useEditProfilePicture = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      formData: FormData,
    ): Promise<{ imageUrl: string | null }> => updateProfileImage(formData),

    onSuccess: (data) => {
      queryClient.setQueryData<IProfileHeader>(
        ["profileHeader", username],
        (old) => (old ? { ...old, imageUrl: data.imageUrl } : old),
      );
    },

    onError: (err: Error) => {
      alert(err.message);
    },
  });
};
