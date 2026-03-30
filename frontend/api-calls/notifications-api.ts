import { BASE_URL } from "@/lib/constants";
import { INotificationResponse } from "@/DTO/INotificationResponse";

export type NotificationsPageDto = {
  content: INotificationResponse[];
  totalElements: number;
  size: number;
  number: number;
  unreadCount: number;
};

export const fetchNotifications = async (
  page = 0,
  size = 10,
): Promise<NotificationsPageDto> => {
  const res = await fetch(
    `${BASE_URL}/api/notifications?page=${page}&size=${size}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch notifications");
  const data = await res.json();
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      size,
      number: page,
      unreadCount: data.filter((n) => !n?.isRead).length,
    };
  }
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements:
      typeof data?.totalElements === "number"
        ? data.totalElements
        : Array.isArray(data?.content)
          ? data.content.length
          : 0,
    size: typeof data?.size === "number" ? data.size : size,
    number: typeof data?.number === "number" ? data.number : page,
    unreadCount: typeof data?.unreadCount === "number" ? data.unreadCount : 0,
  };
};

export const readNotification = async (id: number) => {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res;
};
