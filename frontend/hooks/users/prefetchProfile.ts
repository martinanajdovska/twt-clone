import {fetchProfileFeed, fetchProfileHeader} from "@/api-calls/users-api";
import {QueryClient} from "@tanstack/react-query";

export const prefetchProfile = async ({username, token}:{username:string, token:string}) => {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: ['profile', username, 'tweets'],
            queryFn: ({ pageParam }) => fetchProfileFeed({ pageParam, username, tab: 'tweets' }),
            initialPageParam: 0,
            getNextPageParam: (lastPage: any, allPages: any, lastPageParam: any) => {
                return lastPage.length < 5 ? undefined : lastPageParam + 1;
            },
        }),
        queryClient.prefetchQuery({
            queryKey: ['profileHeader', username],
            queryFn: () => fetchProfileHeader({username}),
        }),
    ]);

    return queryClient;
}