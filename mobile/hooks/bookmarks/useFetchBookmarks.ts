import { fetchBookmarks } from "@/api/bookmarks";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useFetchBookmarks() {
  return useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam }) => fetchBookmarks(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastParam) => {
      const page = Array.isArray(lastPage) ? lastPage : [];
      return page.length < 10 ? undefined : (lastParam as number) + 1;
    },
  });
}
