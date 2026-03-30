import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/api-calls/notifications-api";

export const useGetNotifications = () => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam as number, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.number + 1) * lastPage.size;
      return loaded >= lastPage.totalElements ? undefined : lastPage.number + 1;
    },
  });
};
