import { apiFetch, apiJson } from "@/lib/api";
import { normalizeTweet } from "@/lib/normalizeTweet";
import type { ITweet } from "@/types/tweet";

export async function fetchBookmarks(page: number = 0): Promise<ITweet[]> {
  const data = await apiJson<{ content: ITweet[] }>(
    `/bookmarks?page=${page}&size=10`,
  );
  return (data.content ?? []).map(normalizeTweet);
}

export async function toggleBookmark(
  id: number,
  isBookmarked: boolean,
): Promise<void> {
  const res = await apiFetch(`/bookmarks/${id}`, {
    method: isBookmarked ? "DELETE" : "POST",
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update bookmark");
}
