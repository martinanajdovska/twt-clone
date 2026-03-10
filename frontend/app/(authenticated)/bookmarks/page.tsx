import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchSelfUsernameAndProfilePicture } from '@/api-calls/users-api'
import { BASE_URL } from '@/lib/constants'
import BookmarksFeed from '@/components/bookmarks/BookmarksFeed'

export default async function BookmarksPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  let self
  try {
    self = await fetchSelfUsernameAndProfilePicture({ token })
  } catch {
    redirect(`${BASE_URL}/api/auth/clear-session`)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 hidden md:flex items-center px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
      </header>
      <BookmarksFeed username={self.username} />
    </div>
  )
}
