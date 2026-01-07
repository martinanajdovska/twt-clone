import {fetchTweetDetails} from "@/api-calls/tweets-api";
import {QueryClient} from "@tanstack/react-query";

export const prefetchTweetDetails = async (id:number) => {
    const queryClient = new QueryClient()

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['tweet', id],
        queryFn: ({pageParam}) => fetchTweetDetails({pageParam, id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.length < 5) {
                return undefined;
            }
            return lastPageParam + 1
        },
    })

    return queryClient;
}