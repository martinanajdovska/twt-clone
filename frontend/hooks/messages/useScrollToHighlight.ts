import { useEffect, RefObject } from "react";

export function useScrollToHighlight(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  highlightedId: number | null,
  dependencyList: any[],
) {
  useEffect(() => {
    if (highlightedId == null || !scrollContainerRef.current) return;

    const centerTarget = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const targetEl = container.querySelector(
        `[data-message-id="${highlightedId}"]`,
      ) as HTMLElement | null;

      if (!targetEl) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const targetCenterRelativeToContainer =
        targetRect.top - containerRect.top + targetRect.height / 2;

      const nextScrollTop =
        container.scrollTop +
        (targetCenterRelativeToContainer - container.clientHeight / 2);

      container.scrollTo({
        top: Math.max(0, nextScrollTop),
        behavior: "auto",
      });
    };

    let raf2 = 0;
    let t: ReturnType<typeof setTimeout> | null = null;

    const raf1 = requestAnimationFrame(() => {
      centerTarget();
      raf2 = requestAnimationFrame(() => centerTarget());
      t = setTimeout(() => centerTarget(), 60);
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (t) clearTimeout(t);
    };
  }, [highlightedId, ...dependencyList]);
}
