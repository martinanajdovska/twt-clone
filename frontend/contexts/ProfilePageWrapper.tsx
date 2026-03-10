'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

const BANNER_HEIGHT = 200
const STICKY_HEADER_HEIGHT = 48

const ProfileScrollContext = createContext({ scrolledPastBanner: false, isMobile: false })

export function useProfileScroll() {
  return useContext(ProfileScrollContext)
}

export default function ProfilePageWrapper({
  username,
  children,
}: {
  username: string
  children: React.ReactNode
}) {
  const [scrolledPastBanner, setScrolledPastBanner] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastBanner(window.scrollY > BANNER_HEIGHT - 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ProfileScrollContext.Provider value={{ scrolledPastBanner, isMobile }}>
      <header
        className={`fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-3 py-2 bg-background/95 backdrop-blur-md border-b border-border transition-opacity duration-200 md:hidden ${scrolledPastBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ height: STICKY_HEADER_HEIGHT }}
      >
        <span className="font-bold text-[17px] text-foreground truncate">
          @{username}
        </span>
      </header>

      {children}
    </ProfileScrollContext.Provider>
  )
}

export { STICKY_HEADER_HEIGHT }
