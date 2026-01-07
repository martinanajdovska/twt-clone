'use client'
import { LogOut } from 'lucide-react'
import {useLogout} from "@/hooks/auth/useLogout";


const Logout = () => {

    const { mutate: handleLogout, isPending } = useLogout();

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
