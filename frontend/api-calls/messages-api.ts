import { IConversationListItem } from "@/DTO/IConversationListItem";
import { ICreateConversationResponse } from "@/DTO/ICreateConversationResponse";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import { ISendMessagePayload } from "@/DTO/ISendMessagePayload";
import { BASE_URL } from "@/lib/constants";

export type MessagesPage<T> = {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
};

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

export async function fetchConversations(
  page = 0,
  size = 10,
): Promise<MessagesPage<IConversationListItem>> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations?page=${page}&size=${size}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();

  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      size,
      number: page,
    };
  }

  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements:
      typeof data?.totalElements === "number"
        ? data.totalElements
        : Array.isArray(data?.content)
          ? data.content.length
          : 0,
    size: typeof data?.size === "number" ? data.size : size,
    number: typeof data?.number === "number" ? data.number : page,
  };
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
  page = 0,
  size = 20,
): Promise<MessagesPage<IMessageResponse>> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}/messages?page=${page}&size=${size}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      size,
      number: page,
    };
  }
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements:
      typeof data?.totalElements === "number"
        ? data.totalElements
        : Array.isArray(data?.content)
          ? data.content.length
          : 0,
    size: typeof data?.size === "number" ? data.size : size,
    number: typeof data?.number === "number" ? data.number : page,
  };
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

export async function searchConversationMessages(
  conversationId: number,
  otherUsername: string,
  q: string,
  page = 0,
  size = 20,
): Promise<IMessageResponse[]> {
  const query = new URLSearchParams({
    q,
    conversationId: String(conversationId),
    username: otherUsername,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(
    `${BASE_URL}/api/messages/search?${query.toString()}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to search messages");
  return res.json();
}

export async function fetchMessageContext(
  conversationId: number,
  createdAt: string,
  size = 10,
): Promise<IMessageResponse[]> {
  const res = await fetch(
    `${BASE_URL}/api/messages/conversations/${conversationId}/messages/context?createdAt=${encodeURIComponent(createdAt)}&size=${size}`,
    { credentials: "include" },
  );
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to fetch message context");
  return res.json();
}
