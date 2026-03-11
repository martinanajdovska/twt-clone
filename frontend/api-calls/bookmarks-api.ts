import { API_BASE } from "@/lib/constants";

export const fetchBookmarks = async ({
  pageParam = 0,
}: {
  pageParam: number;
}) => {
  const res = await fetch(
    `${API_BASE}/api/bookmarks?page=${pageParam}&size=5`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  const data = await res.json();
  return data.content ?? [];
};
