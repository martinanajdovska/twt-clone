import { apiFetch, apiJson } from "@/lib/api";
import type { IConversationListItem, IMessageItem } from "@/types/message";

export async function fetchConversations(): Promise<IConversationListItem[]> {
  return apiJson("/messages/conversations");
}

export async function fetchConversation(id: number): Promise<{
  id: number;
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
} | null> {
  const res = await apiFetch(`/messages/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function fetchMessages(
  conversationId: number,
): Promise<IMessageItem[]> {
  return apiJson(`/messages/conversations/${conversationId}/messages`);
}

export async function sendMessage(
  conversationId: number,
  content: string,
  options?: { imageUrl?: string | null; gifUrl?: string | null },
): Promise<IMessageItem> {
  const formData = new FormData();
  formData.append("content", content);
  if (options?.gifUrl) {
    formData.append("gifUrl", options.gifUrl);
  }
  if (options?.imageUrl) {
    const name = options.imageUrl.split("/").pop() || "image.jpg";
    formData.append("image", {
      uri: options.imageUrl,
      name,
      type: "image/jpeg",
    } as unknown as Blob);
  }
  const res = await apiFetch(
    `/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: formData,
    },
  );
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to send message");
  }
  return res.json();
}

export async function createOrGetConversation(otherUsername: string): Promise<{
  id: number;
  otherParticipant: {
    username: string;
    imageUrl: string | null;
    displayName: string | null;
  };
}> {
  return apiJson("/messages/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUsername }),
  });
}

export async function markConversationAsRead(
  conversationId: number,
): Promise<void> {
  const res = await apiFetch(`/messages/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to mark read");
}
