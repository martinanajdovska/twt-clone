import { BASE_URL } from "@/lib/constants";

export const fetchBookmarks = async ({
  pageParam = 0,
}: {
  pageParam: number;
}) => {
  const res = await fetch(
    `${BASE_URL}/api/bookmarks?page=${pageParam}&size=5`,
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
