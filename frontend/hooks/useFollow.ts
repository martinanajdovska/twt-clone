import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useFollow = ({username, token}:{username:string, token:string}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({username, isFollowed}:{username:string, isFollowed:boolean}) => {
            const res = await fetch(`${BASE_URL}/api/users/follows/${username}`, {
                method: `${isFollowed ? "DELETE" : "POST"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)
            }

            return res;
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({queryKey: ['profileHeader', username]});
            queryClient.invalidateQueries({queryKey: ['feed', token]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}