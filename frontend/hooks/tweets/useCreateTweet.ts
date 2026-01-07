import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useCreateTweet = ({username, parentId}:{username:string, parentId?:number}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch(`${BASE_URL}/api/tweets`, {
                method: "POST",
                body: formData,
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