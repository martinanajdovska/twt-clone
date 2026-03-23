import { fetchConversations } from "@/api/messages";
import { useQuery } from "@tanstack/react-query";

export const useFetchConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchConversations(),
  });
};
