import { fetchSelf } from "@/api/users";
import { useQuery } from "@tanstack/react-query";

export const useFetchSelf = () => {
  return useQuery({
    queryKey: ["self"],
    queryFn: fetchSelf,
  });
};
