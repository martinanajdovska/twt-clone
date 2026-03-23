import { BASE_URL } from "@/lib/constants";

export const fetchNotifications = async () => {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    credentials: "include",
  });
  return res.json();
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
