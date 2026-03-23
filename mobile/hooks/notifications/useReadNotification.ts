import { markNotificationRead } from "@/api/notifications";
import { INotificationItem } from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      queryClient.setQueryData<INotificationItem[]>(
        ["notifications"],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? old,
      );
    },
    onError: (_err, id) => {
      queryClient.setQueryData<INotificationItem[]>(
        ["notifications"],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: false } : n)) ?? old,
      );
    },
  });
};
