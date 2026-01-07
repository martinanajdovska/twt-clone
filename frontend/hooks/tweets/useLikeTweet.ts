import {useMutation} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useLikeTweet = () => {

    return useMutation({
        mutationFn: async ({id, isLiked}:{id:number, isLiked:boolean}) => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}/likes`, {
                method: `${isLiked ? "DELETE" : "POST"}`,
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
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}