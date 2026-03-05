import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export const useCreateTweet = ({
    username,
    parentId,
    quoteId,
}: {
    username: string;
    parentId?: number;
    quoteId?: number;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch(`${BASE_URL}/api/tweets`, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            if (parentId != null) {
                queryClient.invalidateQueries({ queryKey: ['tweet', parentId.toString()] });
            }
            if (quoteId != null) {
                queryClient.invalidateQueries({ queryKey: ['tweet', quoteId.toString()] });
            }
        },
        onError: (err) => {
            alert(err.message);
        }
    });
}