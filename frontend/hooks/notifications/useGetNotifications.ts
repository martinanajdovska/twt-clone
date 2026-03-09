import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/api-calls/notifications-api";

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
};
