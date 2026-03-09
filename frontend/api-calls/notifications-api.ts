import { BASE_URL } from "@/lib/constants";

export const fetchNotifications = async () => {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    credentials: "include",
  });
  return res.json();
};
