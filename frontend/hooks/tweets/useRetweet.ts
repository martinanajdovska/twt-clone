import {useMutation, useQueryClient} from "@tanstack/react-query";
import {API_BASE} from "@/lib/constants";

export const useRetweet = (username:string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, isRetweeted}:{id:number, isRetweeted:boolean}) => {
            const res = await fetch(`${API_BASE}/api/tweets/${id}/retweets`, {
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
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            queryClient.invalidateQueries({ queryKey: ['tweet', variables.id.toString()] });
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}