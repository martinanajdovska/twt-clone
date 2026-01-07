import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useRetweet = (username:string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, isRetweeted}:{id:number, isRetweeted:boolean}) => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}/retweets`, {
                method: `${isRetweeted ? "DELETE" : "POST"}`,
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
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', username]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}