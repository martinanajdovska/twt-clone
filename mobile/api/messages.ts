import { apiFetch, apiJson } from "@/lib/api";
import type {
  IConversationListItem,
  IMessageItem,
  IMessagePage,
  IMessageSearchResult,
} from "@/types/message";

function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { content?: unknown }).content)
  ) {
    return (data as { content: T[] }).content;
  }
  return [];
}

export async function fetchConversations(
  page: number = 0,
): Promise<IConversationListItem[]> {
  const data = await apiJson<unknown>(
    `/messages/conversations?page=${page}&size=10`,
  );
  return normalizeListResponse<IConversationListItem>(data);
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
  page: number = 0,
): Promise<IMessagePage> {
  const data = await apiJson<unknown>(
    `/messages/conversations/${conversationId}/messages?page=${page}&size=10`,
  );
  if (Array.isArray(data)) {
    return {
      content: data as IMessageItem[],
      totalElements: (data as IMessageItem[]).length,
      size: 10,
      number: page,
    };
  }
  if (data && typeof data === "object") {
    const pageData = data as Partial<IMessagePage>;
    return {
      content: Array.isArray(pageData.content) ? pageData.content : [],
      totalElements:
        typeof pageData.totalElements === "number"
          ? pageData.totalElements
          : Array.isArray(pageData.content)
            ? pageData.content.length
            : 0,
      size: typeof pageData.size === "number" ? pageData.size : 10,
      number: typeof pageData.number === "number" ? pageData.number : page,
    };
  }
  return {
    content: [],
    totalElements: 0,
    size: 10,
    number: page,
  };
}

export async function sendMessage(
  conversationId: number,
  content: string,
  options?: {
    imageUrl?: string | null;
    imageMimeType?: string | null;
    gifUrl?: string | null;
  },
): Promise<IMessageItem> {
  const formData = new FormData();
  formData.append("content", content);
  if (options?.gifUrl) {
    formData.append("gifUrl", options.gifUrl);
  }
  if (options?.imageUrl) {
    const name = options.imageUrl.split("/").pop() || "image.jpg";
    const type = options.imageMimeType?.trim() || "image/jpeg";
    formData.append("image", {
      uri: options.imageUrl,
      name,
      type,
    } as unknown as Blob);
  }

  const res = await apiFetch(
    `/messages/conversations/${conversationId}/messages`,
    {
      body: formData,
      method: "POST",
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

export async function searchConversationMessages(
  q: string,
  conversationId: number,
  otherUsername: string,
  page: number = 0,
  size: number = 20,
): Promise<IMessageSearchResult[]> {
  const query = new URLSearchParams({
    q,
    conversationId: String(conversationId),
    username: otherUsername,
    page: String(page),
    size: String(size),
  });
  return apiJson<IMessageSearchResult[]>(
    `/messages/search?${query.toString()}`,
  );
}

export async function fetchMessageContext(
  conversationId: number,
  createdAt: string,
  size: number = 10,
): Promise<IMessageItem[]> {
  return apiJson<IMessageItem[]>(
    `/messages/conversations/${conversationId}/messages/context?createdAt=${encodeURIComponent(createdAt)}&size=${size}`,
  );
}

export async function archiveConversation(
  conversationId: number,
): Promise<void> {
  const res = await apiFetch(`/messages/conversations/${conversationId}`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to archive conversation");
  }
}
