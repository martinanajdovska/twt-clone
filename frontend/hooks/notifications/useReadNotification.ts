import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { readNotification } from "@/api-calls/notifications-api";
import type { NotificationsPageDto } from "@/api-calls/notifications-api";

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => readNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData<InfiniteData<NotificationsPageDto>>(
        ["notifications"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  unreadCount: Math.max(
                    0,
                    p.unreadCount -
                      (p.content.some((n) => n.id === id && !n.isRead) ? 1 : 0),
                  ),
                  content: p.content.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n,
                  ),
                })),
              }
            : old,
      );
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      alert(err.message);
    },
  });

  return { ...mutation, readNotification: mutation.mutateAsync };
};
