import {useInfiniteQuery} from "@tanstack/react-query";
import {fetchTweetDetails} from "@/api-calls/tweets-api";

export const useFetchTweetDetails = (id:number) => {
    return useInfiniteQuery({
        queryKey: ['tweet', id],
        queryFn: ({ pageParam }) => fetchTweetDetails({ pageParam , id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.replies.length < 5 ? undefined : lastPageParam + 1;
        },
    })
}