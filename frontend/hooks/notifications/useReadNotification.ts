import { useMutation, useQueryClient } from '@tanstack/react-query';
import {BASE_URL} from "@/lib/constants";

export const useReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id}:{id: number} ) => {
            const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
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
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
};