'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Logout = () => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const { mutate: handleLogout, isPending } = useMutation({
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

    return (
        <div className="mb-4">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                }}
                disabled={isPending}
                className="px-4 py-2 bg-red-500 text-black rounded disabled:bg-gray-400"
            >
                {isPending ? 'Logging out...' : 'Logout'}
            </button>
        </div>
    )
}
export default Logout
