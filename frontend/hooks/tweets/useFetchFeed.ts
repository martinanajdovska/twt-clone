import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProfileFeed } from "@/api-calls/users-api";
import { fetchTweets } from "@/api-calls/tweets-api";

export const useFetchFeed = ({
  username,
  isProfile,
  profileTab = "tweets",
  profileUsername,
}: {
  username: string;
  isProfile: boolean;
  profileTab: string;
  profileUsername: string;
}) => {
  return useInfiniteQuery({
    queryKey: isProfile ? ["profile", profileUsername, profileTab] : ["feed"],
    queryFn: async ({ pageParam }) => {
      const res = isProfile
        ? await fetchProfileFeed({
            pageParam,
            username: profileUsername,
            tab: profileTab,
          })
        : await fetchTweets({ pageParam });
      return Array.isArray(res) ? res : res.content;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any, lastPageParam: any) => {
      return lastPage.length < 5 ? undefined : lastPageParam + 1;
    },
  });
};
