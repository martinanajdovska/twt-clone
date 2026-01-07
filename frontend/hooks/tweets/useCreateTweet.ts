import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useCreateTweet = ({username, parentId}:{username:string, parentId?:number}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({content, parentId}:{content:string, parentId?:number} ) => {
            const res = await fetch(`${BASE_URL}/api/tweets`, {
                method: "POST",
                body: JSON.stringify({content: content, parentId: parentId}),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            queryClient.invalidateQueries({ queryKey: ['tweet', parentId?.toString()] });
            },
        onError: (err) => {
            alert(err.message);
        }
    });
}