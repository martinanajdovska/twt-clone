import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {BASE_URL} from "@/lib/constants";

export const useLogin = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async ({username, password}:{username:string, password:string}) => {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                body: JSON.stringify({username:username, password:password}),
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
            queryClient.clear();

            router.push('/');
            router.refresh();
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}