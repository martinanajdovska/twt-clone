import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BASE_URL } from "@/lib/constants"

export const useSubmitNote = (tweetId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`${BASE_URL}/api/community-notes/tweet/${tweetId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content }),
            })
            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community-notes", "all", tweetId] })
            queryClient.invalidateQueries({ queryKey: ["tweet", String(tweetId)] })
            queryClient.invalidateQueries({ queryKey: ["feed"] })
            queryClient.invalidateQueries({ queryKey: ["profile"] })
        },
        onError: (err: Error) => alert(err.message),
    })
}
