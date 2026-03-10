'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import MobileMenuDrawer from '@/components/layout/MobileMenuDrawer'

const SCROLL_THRESHOLD = 10

function getHeaderTitle(pathname: string): string {
  if (pathname === '/') return 'Home'
  if (pathname === '/bookmarks') return 'Bookmarks'
  if (pathname === '/notifications') return 'Notifications'
  if (pathname.startsWith('/users/')) {
    const username = pathname.replace('/users/', '').split('/')[0]
    return username ? `@${username}` : 'Profile'
  }
  if (pathname.startsWith('/tweets/')) return 'Post'
  return ''
}

export default function MobileTopBar({
  username,
  profilePicture,
}: {
  username: string
  profilePicture: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const title = getHeaderTitle(pathname)
  const isHomePage = pathname === '/'
  const isTweetDetailsPage = pathname.startsWith('/tweets/')

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

  if (!isHomePage) {
    return null
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-md border-b border-border transition-transform duration-200 md:hidden"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="w-9 flex-shrink-0">
        <MobileMenuDrawer username={username} profilePicture={profilePicture} />
      </div>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-foreground">
        {title}
      </h1>
      <div className="w-9 flex-shrink-0" />
    </header>
  )
}
