import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";
import {useRouter} from "next/navigation";

export const useLogout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }
            return response;
        },
        onSuccess: () => {
            queryClient.clear();
            router.push('/login');
            router.refresh();
        },
        onError: (error) => {
            alert(error.message || "Error while logging out");
        }
    });
}