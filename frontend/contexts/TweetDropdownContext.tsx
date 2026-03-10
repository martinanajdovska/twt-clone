'use client'

import React, { createContext, useContext } from 'react'

type TweetDropdownContextValue = {
  onOpenChange: (open: boolean) => void
}

const TweetDropdownContext = createContext<TweetDropdownContextValue | null>(null)

export function useTweetDropdown() {
  return useContext(TweetDropdownContext)
}

export function TweetDropdownProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: TweetDropdownContextValue
}) {
  return (
    <TweetDropdownContext.Provider value={value}>
      {children}
    </TweetDropdownContext.Provider>
  )
}
