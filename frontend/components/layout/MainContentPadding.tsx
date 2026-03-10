'use client'

import { usePathname } from 'next/navigation'

export default function MainContentPadding({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hasMobileHeader = pathname === '/' || pathname === '/bookmarks'

  return (
    <div className={hasMobileHeader ? 'pt-14 md:pt-0 min-h-full' : 'min-h-full'}>
      {children}
    </div>
  )
}
