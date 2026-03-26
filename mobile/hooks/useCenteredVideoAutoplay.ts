import { useCallback, useEffect, useRef, useState } from "react";
import type { View } from "react-native";
import type { ViewToken } from "react-native";

type MeasureRect = { x: number; y: number; width: number; height: number };

function measureView(view: View | null): Promise<MeasureRect | null> {
  return new Promise((resolve) => {
    if (!view) {
      resolve(null);
      return;
    }
    view.measureInWindow((x, y, w, h) => {
      resolve({ x, y, width: w, height: h });
    });
  });
}

export function useCenteredVideoAutoplay<T>(
  extractVideoTweetId: (item: T) => number | null,
) {
  const extractRef = useRef(extractVideoTweetId);
  extractRef.current = extractVideoTweetId;

  const viewportRef = useRef<View>(null);
  const rowRefs = useRef<Map<number, View>>(new Map());
  const visibleVideoIdsRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);

  const [activeVideoTweetId, setActiveVideoTweetId] = useState<number | null>(
    null,
  );

  const recompute = useCallback(async () => {
    const viewport = await measureView(viewportRef.current);
    if (!viewport) return;

    const centerY = viewport.y + viewport.height / 2;
    const ids = [...visibleVideoIdsRef.current];
    if (ids.length === 0) {
      setActiveVideoTweetId((prev) => (prev == null ? prev : null));
      return;
    }

    const rects = await Promise.all(
      ids.map((id) => measureView(rowRefs.current.get(id) ?? null)),
    );

    let bestId: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    ids.forEach((id, i) => {
      const r = rects[i];
      if (!r) return;
      const rowCenterY = r.y + r.height / 2;
      const d = Math.abs(rowCenterY - centerY);
      if (d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    });
    setActiveVideoTweetId((prev) => (prev === bestId ? prev : bestId));
  }, []);

  const scheduleRecomputeRef = useRef<() => void>(() => {});

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      void recompute();
    });
  }, [recompute]);

  scheduleRecomputeRef.current = scheduleRecompute;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = new Set<number>();
      viewableItems.forEach((vi) => {
        const id = extractRef.current(vi.item as T);
        if (id != null) next.add(id);
      });
      visibleVideoIdsRef.current = next;
      scheduleRecomputeRef.current();
    },
  );

  const setRowRef = useCallback((tweetId: number, node: View | null) => {
    if (node) {
      rowRefs.current.set(tweetId, node);
    } else {
      rowRefs.current.delete(tweetId);
    }
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  return {
    activeVideoTweetId,
    viewportRef,
    setRowRef,
    scheduleRecompute,
    onViewableItemsChanged,
  };
}
