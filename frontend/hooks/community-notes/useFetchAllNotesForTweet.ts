import { useQuery } from "@tanstack/react-query"
import { BASE_URL } from "@/lib/constants"

export type AllNoteItem = {
    id: number
    content: string
    isVisible: boolean
    authorUsername: string
    helpfulCount: number
    notHelpfulCount: number
}

export const useFetchAllNotesForTweet = (tweetId: number, enabled: boolean) => {
    return useQuery({
        queryKey: ["community-notes", "all", tweetId],
        queryFn: async (): Promise<AllNoteItem[]> => {
            const res = await fetch(
                `${BASE_URL}/api/community-notes/tweet/${tweetId}/all`,
                { credentials: "include" }
            )
            if (!res.ok) throw new Error("Failed to fetch notes")
            return res.json()
        },
        enabled: enabled && !!tweetId,
    })
}
