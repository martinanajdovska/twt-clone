import { useCallback } from "react";

interface UseKeyboardNavigationProps {
  items: unknown[];
  highlightedIndex: number;
  setHighlightedIndex: (fn: (i: number) => number) => void;
  onSelect: (index: number) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export function useKeyboardNavigation({
  items,
  highlightedIndex,
  setHighlightedIndex,
  onSelect,
  onClose,
  isOpen = true,
}: UseKeyboardNavigationProps) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(highlightedIndex);
      } else if (e.key === "Escape") {
        onClose?.();
      }
    },
    [
      items.length,
      highlightedIndex,
      isOpen,
      onSelect,
      onClose,
      setHighlightedIndex,
    ],
  );
}
