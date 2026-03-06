import {useInfiniteQuery} from "@tanstack/react-query";
import {fetchTweetDetails} from "@/api-calls/tweets-api";

export const useFetchTweetDetails = (id: number) => {
    return useInfiniteQuery({
        queryKey: ['tweet', String(id)],
        queryFn: ({ pageParam }) => fetchTweetDetails({ pageParam , id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage: any, allPages: any, lastPageParam: any) => {
            return lastPage.replies.length < 5 ? undefined : lastPageParam + 1;
        },
    })
}