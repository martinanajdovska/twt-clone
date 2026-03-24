import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ComposeParams = {
  parentId?: number;
  quotedTweetId?: number;
  topOffset?: number;
};

type ComposeContextValue = {
  isVisible: boolean;
  parentId?: number;
  quotedTweetId?: number;
  topOffset: number;
  openCompose: (params?: ComposeParams) => void;
  closeCompose: () => void;
};

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [quotedTweetId, setQuotedTweetId] = useState<number | undefined>(undefined);
  const [topOffset, setTopOffset] = useState(0);

  const openCompose = useCallback((params?: ComposeParams) => {
    setParentId(params?.parentId);
    setQuotedTweetId(params?.quotedTweetId);
    setTopOffset(params?.topOffset ?? 0);
    setIsVisible(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsVisible(false);
    setParentId(undefined);
    setQuotedTweetId(undefined);
    setTopOffset(0);
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      parentId,
      quotedTweetId,
      topOffset,
      openCompose,
      closeCompose,
    }),
    [isVisible, parentId, quotedTweetId, topOffset, openCompose, closeCompose],
  );

  return <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>;
}

export function useCompose() {
  const context = useContext(ComposeContext);
  if (!context) {
    throw new Error('useCompose must be used within a ComposeProvider');
  }
  return context;
}
