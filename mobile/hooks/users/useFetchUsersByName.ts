import { fetchUsersByUsername } from "@/api/users";
import { useQuery } from "@tanstack/react-query";

export const useFetchUsersByName = (debouncedQ: string) => {
  return useQuery({
    queryKey: ["search-users", debouncedQ],
    queryFn: () => fetchUsersByUsername(debouncedQ),
    enabled: debouncedQ.length > 0,
  });
};
