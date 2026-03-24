import { markNotificationRead } from "@/api/notifications";
import { INotificationPage } from "@/types/notification";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      queryClient.setQueryData<InfiniteData<INotificationPage>>(
        ["notifications"],
        (old) => {
          if (!old) return old;

          const wasUnread = old.pages.some((page) =>
            page.content.some((n) => n.id === id && !n.isRead),
          );
          const pages = old.pages.map((page) => ({
            ...page,
            content: page.content.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          }));

          if (pages[0]) {
            pages[0] = {
              ...pages[0],
              unreadCount: wasUnread
                ? Math.max(0, (pages[0].unreadCount ?? 0) - 1)
                : pages[0].unreadCount ?? 0,
            };
          }

          return {
            ...old,
            pages,
          };
        },
      );
    },
    onError: (_err, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
