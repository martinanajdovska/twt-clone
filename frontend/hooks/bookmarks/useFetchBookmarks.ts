import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBookmarks } from "@/api-calls/bookmarks-api";

export const useFetchBookmarks = () => {
  return useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam }) => fetchBookmarks({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any, lastPageParam: any) => {
      return lastPage.length < 5 ? undefined : lastPageParam + 1;
    },
  });
};
