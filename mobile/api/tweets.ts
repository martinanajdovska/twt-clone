import { apiFetch, apiJson } from "@/lib/api";
import type { ITweet, ITweetDetailsResponse, IVideoTweetsResponse } from "@/types/tweet";


export async function fetchTweets(page: number): Promise<ITweet[]> {
  const data = await apiJson<{ content: ITweet[] }>(`/tweets?page=${page}`);
  return data.content ?? [];
}

export async function fetchTweetDetails(
  id: number,
  page: number = 0,
): Promise<ITweetDetailsResponse> {
  return apiJson(`/tweets/${id}/details?page=${page}`);
}

export async function fetchTweetsBySearch(q: string): Promise<ITweet[]> {
  const data = await apiJson<ITweet[] | { content: ITweet[] }>(
    `/tweets/search?q=${encodeURIComponent(q)}`,
  );
  return Array.isArray(data)
    ? data
    : ((data as { content: ITweet[] }).content ?? []);
}

export async function createTweet(formData: FormData): Promise<ITweet> {
  const { getStoredToken } = await import("@/lib/auth-store");
  const { API_URL } = await import("@/lib/constants");
  const token = await getStoredToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/tweets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to create tweet");
  return res.json();
}

export async function toggleLike(id: number, isLiked: boolean): Promise<void> {
  const res = await apiFetch(`/tweets/${id}/likes`, {
    method: isLiked ? "DELETE" : "POST",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to update like");
}

export async function toggleRetweet(
  id: number,
  isRetweeted: boolean,
): Promise<void> {
  const res = await apiFetch(`/tweets/${id}/retweets`, {
    method: isRetweeted ? "DELETE" : "POST",
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update retweet");
}

export async function deleteTweet(id: number): Promise<void> {
  const res = await apiFetch(`/tweets/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to delete tweet");
}

export async function pinTweet(id: number): Promise<void> {
  const res = await apiFetch(`/tweets/${id}/pin`, {
    method: "POST",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to pin tweet");
}

export async function unpinTweet(id: number): Promise<void> {
  const res = await apiFetch(`/tweets/${id}/pin`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to unpin tweet");
}

export async function fetchTweetQuotes(
  tweetId: number,
  page: number,
): Promise<ITweet[]> {
  const data = await apiJson<{ content: ITweet[] }>(
    `/tweets/${tweetId}/quotes?page=${page}`,
  );
  return data.content ?? [];
}

export async function votePoll(id: number, optionId: number): Promise<void> {
  const res = await apiFetch(`/tweets/${id}/poll/vote`, {
    method: "POST",
    body: JSON.stringify({ optionId }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to vote poll");
}

export async function fetchVideoTweets(
  page?: number,
): Promise<IVideoTweetsResponse> {
  return apiJson<IVideoTweetsResponse>(`/tweets/videos?page=${page}`);
}
