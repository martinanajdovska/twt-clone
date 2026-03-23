import { apiFetch, apiJson } from "@/lib/api";
import type { INotificationItem } from "@/types/notification";

export async function fetchNotifications(): Promise<INotificationItem[]> {
  const data = await apiJson<
    INotificationItem[] | { content?: INotificationItem[] }
  >("/notifications");
  return Array.isArray(data)
    ? data
    : ((data as { content?: INotificationItem[] }).content ?? []);
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
