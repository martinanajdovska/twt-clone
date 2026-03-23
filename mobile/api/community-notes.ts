import { apiFetch, apiJson } from "@/lib/api";
import { ICommunityNoteDisplay, IAllNoteItem } from "@/types/community-notes";

export async function submitNote(
  tweetId: number,
  content: string,
): Promise<ICommunityNoteDisplay> {
  const res = await apiFetch(`/community-notes/tweet/${tweetId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to submit note");
  }
  return res.json();
}

export async function rateNote(
  noteId: number,
  helpful: boolean,
): Promise<void> {
  const res = await apiFetch(`/community-notes/${noteId}/rate`, {
    method: "POST",
    body: JSON.stringify({ helpful }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to rate note");
  }
}

export async function fetchAllNotesForTweet(
  tweetId: number,
): Promise<IAllNoteItem[]> {
  return apiJson<IAllNoteItem[]>(`/community-notes/tweet/${tweetId}/all`);
}
