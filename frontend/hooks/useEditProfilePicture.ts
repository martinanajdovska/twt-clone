import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useEditProfilePicture = (username:string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData:FormData ) => {
            const res = await fetch(`${BASE_URL}/api/users/me/image`, {
                method: "PATCH",
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)
            }

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', username]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
};