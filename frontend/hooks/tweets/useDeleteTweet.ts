import {useMutation, useQueryClient} from "@tanstack/react-query";
import { API_BASE } from "@/lib/constants";

export const useDeleteTweet = ({username, parentId}:{username:string, parentId?:number}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id}:{id:number, username:string, parentId?:number}) => {
            const res = await fetch(`${API_BASE}/api/tweets/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (res.status !== 204) {
                const error = await res.text()
                throw new Error(error)
            }

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', username]});
            queryClient.invalidateQueries({queryKey: ['tweet', parentId?.toString()]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}