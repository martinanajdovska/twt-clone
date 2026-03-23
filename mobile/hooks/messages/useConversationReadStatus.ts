import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { markConversationAsRead } from "@/api/messages";
import { markConversationAsReadInCache } from "@/lib/cache-updates";
import { connectRealtime } from "@/lib/realtime";
import { getStoredToken } from "@/lib/auth-store";

/**
 * Marks a conversation as read when the component mounts.
 * Optimistically updates the cache, then syncs with the server.
 */
export function useMarkConversationAsRead(conversationId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isNaN(conversationId)) return;

    let cancelled = false;

    // Optimistically mark as read in cache
    markConversationAsReadInCache(queryClient, conversationId);

    // Sync with server
    markConversationAsRead(conversationId)
      .then(() => {
        if (!cancelled) {
          markConversationAsReadInCache(queryClient, conversationId);
          // Re-fetch to avoid race with realtime invalidation while DB lastReadAt updates
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      })
      .catch(() => {
        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, queryClient]);
}

/**
 * Listens for new messages in the current conversation and marks them as read.
 * Only marks messages as read if they're for the currently open conversation.
 */
export function useMarkNewMessagesAsRead(conversationId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isNaN(conversationId)) return;

    let socketObj: ReturnType<typeof connectRealtime> | null = null;
    let cancelled = false;

    const handler = (
      payload: { conversationId?: number } | null | undefined,
    ) => {
      const incomingId = payload?.conversationId;
      if (incomingId !== conversationId) return;

      // Optimistically mark as read
      markConversationAsReadInCache(queryClient, conversationId);

      // Sync with server
      markConversationAsRead(conversationId)
        .then(() => {
          if (!cancelled) {
            markConversationAsReadInCache(queryClient, conversationId);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        })
        .catch(() => {
          if (!cancelled) {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        });
    };

    // Connect to realtime socket and listen for new messages
    (async () => {
      const token = await getStoredToken();
      if (cancelled || !token) return;

      socketObj = connectRealtime(token);
      socketObj.on("new_message", handler as any);
    })();

    return () => {
      cancelled = true;
      socketObj?.off("new_message", handler as any);
    };
  }, [conversationId, queryClient]);
}

/**
 * Combines both hooks for convenience.
 * Marks conversation as read on mount and listens for new messages.
 */
export function useConversationReadStatus(conversationId: number) {
  useMarkConversationAsRead(conversationId);
  useMarkNewMessagesAsRead(conversationId);
}
