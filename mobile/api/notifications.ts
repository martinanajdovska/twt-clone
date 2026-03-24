import { apiFetch, apiJson } from "@/lib/api";
import type {
  INotificationItem,
  INotificationPage,
} from "@/types/notification";

export async function fetchNotifications(
  page: number = 0,
): Promise<INotificationPage> {
  const data = await apiJson<
    INotificationItem[] | { content?: INotificationItem[] }
  >(`/notifications?page=${page}&size=10`);
  if (Array.isArray(data)) {
    return {
      content: data as INotificationItem[],
      totalElements: (data as INotificationItem[]).length,
      size: 10,
      number: page,
      unreadCount: 0,
    };
  }
  if (data && typeof data === "object") {
    const pageData = data as Partial<INotificationPage>;
    return {
      content: Array.isArray(pageData.content) ? pageData.content : [],
      totalElements:
        typeof pageData.totalElements === "number"
          ? pageData.totalElements
          : Array.isArray(pageData.content)
            ? pageData.content.length
            : 0,
      size: typeof pageData.size === "number" ? pageData.size : 10,
      number: typeof pageData.number === "number" ? pageData.number : page,
      unreadCount:
        typeof pageData.unreadCount === "number" ? pageData.unreadCount : 0,
    };
  }
  return {
    content: [],
    totalElements: 0,
    size: 10,
    number: page,
    unreadCount: 0,
  };
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await apiFetch(`/notifications/${id}`, { method: "PATCH" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to mark read");
}

export async function syncPushTokenToBackend(token: string) {
  const res = await apiFetch(`/push-tokens`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to sync push token");
}
