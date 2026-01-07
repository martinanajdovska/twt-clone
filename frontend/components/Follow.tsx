'use client'
import {useState} from "react";
import {useFollow} from "@/hooks/useFollow";

const Follow = ({username, isFollowed, token}: {username:string, isFollowed:boolean, token:string}) => {
    const [isFollowedState, setIsFollowedState] = useState(isFollowed)

    const { mutate: handleFollow, isPending } = useFollow({username, token});

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        setIsFollowedState(!isFollowedState);

        handleFollow({username, isFollowed:isFollowedState}, {
            onError: () => {
                // rollback if it fails on server
                setIsFollowedState(!isFollowedState);
            }
        });
    };

    return (
        <div className="flex items-center">
            <button
                disabled={isPending}
                onClick={handleClick}
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
                    isFollowedState ? "Unfollow" : "Follow"
                )}
            </button>
        </div>
    )
}
export default Follow
