import { TrashIcon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useDeleteTweet } from "@/hooks/tweets/useDeleteTweet"

const Delete = ({ username, id, parentId }: { username: string; id: number; parentId?: number }) => {
    const { mutate: handleDelete, isPending } = useDeleteTweet({ username, parentId })

    return (
        <DropdownMenuItem
            disabled={isPending}
            variant="destructive"
            onClick={(e) => {
                e.preventDefault()
                handleDelete({ id, username, parentId })
            }}
        >
            <TrashIcon size={18} />
            Delete
        </DropdownMenuItem>
    )
}
export default Delete
