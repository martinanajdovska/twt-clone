import {QueryClient} from "@tanstack/react-query";
import {fetchTweets} from "@/api-calls/tweets-api";

export const prefetchFeed = async () => {
    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['feed'],
        queryFn: ({ pageParam }) => fetchTweets({ pageParam }),
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