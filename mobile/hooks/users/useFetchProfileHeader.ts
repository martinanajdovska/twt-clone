import { fetchProfileHeader } from "@/api/users";
import { useQuery } from "@tanstack/react-query";

export function useFetchProfileHeader(username: string) {
  return useQuery({
    queryKey: ["profileHeader", username],
    queryFn: () => fetchProfileHeader(username),
    enabled: !!username,
  });
}
