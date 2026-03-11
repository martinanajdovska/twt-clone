import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "@/lib/constants"

export type AllNoteItem = {
    id: number
    content: string
    isVisible: boolean
    authorUsername: string
    helpfulCount: number
    notHelpfulCount: number
    isHelpful: boolean | null
}

export const useFetchAllNotesForTweet = (tweetId: number, enabled: boolean) => {
    return useQuery({
        queryKey: ["community-notes", "all", tweetId],
        queryFn: async (): Promise<AllNoteItem[]> => {
            const res = await fetch(
                `${API_BASE}/api/community-notes/tweet/${tweetId}/all`,
                { credentials: "include" }
            )
            if (!res.ok) throw new Error("Failed to fetch notes")
            return res.json()
        },
        enabled: enabled && !!tweetId,
    })
}
