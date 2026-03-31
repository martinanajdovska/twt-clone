import { useState, useCallback, useEffect } from "react";

interface JumpTarget {
  id: number;
  createdAt: string;
}

export function useMessageJump(
  conversationId: number,
  searchTarget: JumpTarget | null,
  fetchContextFn: (id: number, date: string, limit: number) => Promise<any[]>,
) {
  const [contextMessages, setContextMessages] = useState<any[] | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const jumpToResult = useCallback(
    async (target: JumpTarget) => {
      try {
        const context = await fetchContextFn(
          conversationId,
          target.createdAt,
          10,
        );

        const seen = new Set<number>();
        const ordered = context
          .filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          })
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        if (ordered.length > 0) {
          setContextMessages(ordered);
          setHighlightedId(target.id);
          return;
        }

        setContextMessages(null);
        setHighlightedId(null);
      } catch (error) {
        console.error("Failed to jump to message:", error);
      }
    },
    [conversationId, fetchContextFn],
  );

  useEffect(() => {
    if (searchTarget) {
      jumpToResult(searchTarget);
      return;
    }

    setContextMessages(null);
    setHighlightedId(null);
  }, [searchTarget, jumpToResult]);

  return {
    contextMessages,
    setContextMessages,
    highlightedId,
    setHighlightedId,
  };
}
