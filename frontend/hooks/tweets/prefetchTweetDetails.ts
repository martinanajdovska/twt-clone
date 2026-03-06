import {fetchTweetDetails} from "@/api-calls/tweets-api";
import {QueryClient} from "@tanstack/react-query";

export const prefetchTweetDetails = async (id:number) => {
    const queryClient = new QueryClient()

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['tweet', String(id)],
        queryFn: ({pageParam}) => fetchTweetDetails({pageParam, id}),
        initialPageParam: 0,
        getNextPageParam: (lastPage: any, allPages: any, lastPageParam: any) => {
            if (lastPage.replies.length < 5) {
                return undefined;
            }
            return lastPageParam + 1
        },
    })

    return queryClient;
}