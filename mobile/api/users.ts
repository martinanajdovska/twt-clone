import { apiFetch, apiJson } from "@/lib/api";
import type { ITweet } from "@/types/tweet";
import type { IProfileHeader, IUpdateProfileResponse } from "@/types/profile";

export async function fetchSelf(): Promise<{
  username: string;
  profilePicture: string | null;
  displayName: string | null;
}> {
  return apiJson("/users/me/info");
}

export async function fetchProfileHeader(
  username: string,
): Promise<IProfileHeader> {
  return apiJson(`/users/${username}/info`);
}

export async function fetchProfileFeed(
  username: string,
  page: number,
  tab: "tweets" | "replies" | "likes" | "media" = "tweets",
): Promise<ITweet[]> {
  const data = await apiJson<{ tweets: ITweet[] }>(
    `/users/${username}?page=${page}&tab=${tab}`,
  );
  return data.tweets ?? [];
}

export async function fetchUsersByUsername(
  searchTerm: string,
): Promise<
  { username: string; displayName: string | null; imageUrl: string | null }[]
> {
  if (!searchTerm.trim()) return [];
  return apiJson(`/users?search=${encodeURIComponent(searchTerm.trim())}`);
}

export async function toggleFollow(
  username: string,
  isFollowed: boolean,
): Promise<void> {
  const res = await apiFetch(`/users/follows/${username}`, {
    method: isFollowed ? "DELETE" : "POST",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to update follow");
}

export async function updateProfile(
  formData: FormData,
): Promise<IUpdateProfileResponse> {
  const res = await apiFetch("/users/me/profile", {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update profile");
  return res.json();
}

export async function updateProfileImage(
  uri: string,
): Promise<{ imageUrl: string | null }> {
  const formData = new FormData();
  const name = uri.split("/").pop() || "image.jpg";
  formData.append("image", {
    uri,
    name,
    type: "image/jpeg",
  } as unknown as Blob);
  const res = await apiFetch("/users/me/image", {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update profile image");
  return res.json();
}
