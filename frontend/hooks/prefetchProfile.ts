import {fetchProfileFeed, fetchProfileInfo} from "@/api-calls/users-api";
import {QueryClient} from "@tanstack/react-query";

export const prefetchProfile = async ({username, token}:{username:string, token:string}) => {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: ['profile', username],
            queryFn: ({ pageParam }) => fetchProfileFeed({ pageParam, username }),
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages, lastPageParam) => {
                return lastPage.length < 5 ? undefined : lastPageParam + 1;
            },
        }),
        queryClient.prefetchQuery({
            queryKey: ['profileHeader', username],
            queryFn: () => fetchProfileInfo({username}),
        }),
    ]);

    return queryClient;
}