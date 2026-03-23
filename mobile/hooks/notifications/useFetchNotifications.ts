import { fetchNotifications } from "@/api/notifications";
import { useQuery } from "@tanstack/react-query";

export const useFetchNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
};
