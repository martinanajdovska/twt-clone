import { IConversationListItem } from "@/DTO/IConversationListItem";
import { ICreateConversationResponse } from "@/DTO/ICreateConversationResponse";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import { ISendMessagePayload } from "@/DTO/ISendMessagePayload";
import { BASE_URL } from "@/lib/constants";

export async function fetchConversation(
  conversationId: number,
): Promise<ICreateConversationResponse | null> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function fetchConversations(): Promise<IConversationListItem[]> {
  const res = await fetch(`${BASE_URL}/api/messages/conversations`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/messages/unread-count`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  const data = await res.json();
  return data.count ?? 0;
}

export async function markConversationAsRead(
  conversationId: number,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}/read`,
    { method: "PATCH", credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to mark as read");
}

export async function createOrGetConversation(
  otherUsername: string,
): Promise<ICreateConversationResponse> {
  const res = await fetch(`${BASE_URL}/api/messages/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ otherUsername }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create conversation");
  }
  return res.json();
}

export async function fetchMessages(
  conversationId: number,
): Promise<IMessageResponse[]> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}/messages`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function sendMessage(
  conversationId: number,
  payload: ISendMessagePayload,
): Promise<IMessageResponse> {
  const { content, imageFile, gifUrl } = payload;
  const hasMedia = imageFile || gifUrl;

  if (hasMedia) {
    const formData = new FormData();
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);
    if (gifUrl) formData.append("gifUrl", gifUrl);

    const res = await fetch(
      `${BASE_URL}/api/messages/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to send message");
    }
    return res.json();
  }

  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to send message");
  }
  return res.json();
}

export const archiveConversation = async (id: number) => {
  const res = await fetch(`${BASE_URL}/api/messages/conversations/${id}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
};
