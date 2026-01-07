import {useMutation} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {BASE_URL} from "@/lib/constants";

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async ({username, password, email}:{username:string, password:string, email:string}) => {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: "POST",
                body: JSON.stringify({username:username, password:password, email:email}),
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
            router.push('/');
            router.refresh();
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });
}