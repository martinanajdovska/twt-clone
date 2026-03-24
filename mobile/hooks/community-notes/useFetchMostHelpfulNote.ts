import { useQuery } from "@tanstack/react-query";
import { fetchMostHelpfulNoteWithRating } from "@/api/community-notes";

export function useFetchMostHelpfulNote(tweetId: number) {
  return useQuery({
    queryKey: ["community-notes", "most-helpful", tweetId],
    queryFn: () => fetchMostHelpfulNoteWithRating(tweetId),
  });
}
