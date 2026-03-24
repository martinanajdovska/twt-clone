import { fetchAllNotesForTweet } from "@/api/community-notes";
import { useQuery } from "@tanstack/react-query";

export default function useFetchNotesForTweet(tweetId: number, enabled = true) {
    return useQuery({
        queryKey: ['community-notes', 'all', tweetId],
        queryFn: () => fetchAllNotesForTweet(tweetId),
        enabled: !!tweetId && enabled,
      });
    }