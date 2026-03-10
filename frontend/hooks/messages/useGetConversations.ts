import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/api-calls/messages-api";

export const useGetConversations = () => {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: fetchConversations,
  });
};
