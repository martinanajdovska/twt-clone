import {useQuery} from "@tanstack/react-query";
import {getNotifications} from "@/api-calls/notifications-api";

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications
    });
}