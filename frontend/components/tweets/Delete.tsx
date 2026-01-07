import React from 'react'
import {MoreHorizontal, TrashIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

import {useDeleteTweet} from "@/hooks/tweets/useDeleteTweet";

const Delete = ({username, id, parentId}: { username: string, id: number, parentId?: number }) => {

    const { mutate: handleDelete, isPending } = useDeleteTweet({username, parentId});

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
                                          handleDelete({id,username,parentId});
                                      }}>
                        <TrashIcon fill="red" size={18}/>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
export default Delete
