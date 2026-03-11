import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/constants";

export const useLikeTweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, isLiked }: { id: number; isLiked: boolean }) => {
            const res = await fetch(`${API_BASE}/api/tweets/${id}/likes`, {
                method: `${isLiked ? "DELETE" : "POST"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tweet', variables.id.toString()] });
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
};