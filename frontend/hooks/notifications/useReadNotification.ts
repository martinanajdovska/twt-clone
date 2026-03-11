import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from "@/lib/constants";

export const useReadNotification = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({id}:{id: number} ) => {
            const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
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

    return { ...mutation, readNotification: mutation.mutateAsync };
};