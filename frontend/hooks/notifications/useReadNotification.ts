import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readNotification } from "@/api-calls/notifications-api";

type NotificationItem = { id: number; isRead?: boolean; [k: string]: unknown };

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => readNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData<NotificationItem[]>(
        ["notifications"],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? old,
      );
    },
    onError: (err, id) => {
      queryClient.setQueryData<NotificationItem[]>(
        ["notifications"],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: false } : n)) ?? old,
      );
      alert(err.message);
    },
  });

  return { ...mutation, readNotification: mutation.mutateAsync };
};
