import { fetchNotifications } from "@/api/notifications";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { INotificationPage } from "@/types/notification";

export const useFetchNotifications = () => {
  return useInfiniteQuery<INotificationPage>({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = (lastPage.number + 1) * lastPage.size;
      return loaded >= lastPage.totalElements ? undefined : lastPage.number + 1;
    },
  });
};
