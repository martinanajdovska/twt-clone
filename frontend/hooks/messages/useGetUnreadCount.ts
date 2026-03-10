import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "@/api-calls/messages-api";

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: fetchUnreadCount,
  });
};
