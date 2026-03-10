'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Search from '@/components/ui/Search'

const SCROLL_THRESHOLD = 10

export default function MobileTopBar() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const atTop = y <= SCROLL_THRESHOLD
        const scrollingUp = y < lastScrollY.current
        setVisible(atTop || scrollingUp)
        lastScrollY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = pathname === '/'
  const isBookmarksPage = pathname === '/bookmarks'
  const showHeader = isHomePage || isBookmarksPage
  if (!showHeader) {
    return null
  }

  const title = isHomePage ? 'Home' : 'Bookmarks'

  return (
    <header
      className="fixed top-0 left-[72px] right-0 z-20 flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-md border-b border-border transition-transform duration-200 md:hidden"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <h1 className="text-lg font-bold text-foreground shrink-0">{title}</h1>
      {isHomePage && (
        <div className="w-[50%] max-w-[50%] min-w-0 flex justify-end">
          <Suspense fallback={<div className="animate-pulse h-10 w-full max-w-[120px] rounded-full bg-muted" />}>
            <Search />
          </Suspense>
        </div>
      )}
    </header>
  )
}
