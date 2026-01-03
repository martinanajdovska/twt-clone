'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'

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
        <div className="w-full">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                }}
                disabled={isPending}
                className="group flex w-full items-center justify-start gap-3 rounded-full px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
                {isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                ) : (
                    <LogOut size={20} className="group-hover:text-destructive" />
                )}
                <span>{isPending ? 'Logging out...' : 'Logout'}</span>
            </button>
        </div>
    )
}
export default Logout
