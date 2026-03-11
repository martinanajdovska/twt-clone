import { API_BASE } from "@/lib/constants";

export const fetchNotifications = async () => {
  const res = await fetch(`${API_BASE}/api/notifications`, {
    credentials: "include",
  });
  return res.json();
};
