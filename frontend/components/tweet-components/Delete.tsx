import React from 'react'
import {MoreHorizontal, TrashIcon} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Delete = ({username, id, parentId}: { username: string, id: number, parentId?: number }) => {
    const queryClient = useQueryClient();

    const {mutate: handleDelete, isPending} = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${BASE_URL}/api/tweets/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (res.status !== 204) {
                const error = await res.text()
                throw new Error(error)
            }

            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', username]});
            queryClient.invalidateQueries({queryKey: ['tweet', parentId?.toString()]});
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreHorizontal size={18}/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem disabled={isPending}
                                      onClick={(e) => {
                                          e.preventDefault();
                                          handleDelete();
                                      }}>
                        <TrashIcon fill="red" size={18}/>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
export default Delete
