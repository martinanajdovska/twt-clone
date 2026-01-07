import {useInfiniteQuery} from "@tanstack/react-query";
import {fetchProfileFeed} from "@/api-calls/users-api";
import {fetchTweets} from "@/api-calls/tweets-api";


export const useFetchFeed = ({username, isProfile}:{username:string, isProfile:boolean}) => {
    return useInfiniteQuery({
        // check if trying to load a user profile or normal feed
        // and use the relevant key and function for caching
        queryKey: isProfile ? ['profile', username] : ['feed'],
        queryFn: async ({ pageParam }) => {
            const res = isProfile
                ? await fetchProfileFeed({ pageParam, username })
                : await fetchTweets({ pageParam });
            // normalize the api response
            return Array.isArray(res) ? res : res.content;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.length < 5 ? undefined : lastPageParam + 1;
        },
    })
}