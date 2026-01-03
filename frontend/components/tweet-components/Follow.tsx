'use client'
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Follow = ({username, isFollowed}:
                {username:string, isFollowed:boolean}) => {
    const [isFollowedState, setIsFollowedState] = useState(isFollowed)
    const queryClient = useQueryClient();

    const {mutate: followUser, isPending} = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${BASE_URL}/api/users/follows/${username}`, {
                method: `${isFollowedState ? "DELETE" : "POST"}`,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Error following user");
            }

            return res;
        },
        onSuccess: async () => {
            setIsFollowedState(!isFollowedState);
            await queryClient.invalidateQueries({queryKey: ['profile', username]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    return (
        <div className="flex items-center">
            <button
                disabled={isPending}
                onClick={(e) => {
                    e.preventDefault();
                    followUser();
                }}
                className={`
                    px-4 py-1.5 rounded-full font-bold text-sm transition-all
                    ${isFollowedState
                    ? "bg-transparent border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    : "bg-primary text-primary-foreground hover:opacity-90"}
                    ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
            >
                {isPending ? (
                    <span className="flex items-center gap-2">
                        <span className="h-3 w-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                        Processing...
                    </span>
                ) : (
                    isFollowedState ? "Following" : "Follow"
                )}
            </button>
        </div>
    )
}
export default Follow
