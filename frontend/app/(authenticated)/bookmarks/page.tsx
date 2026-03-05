import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchSelfUsernameAndProfilePicture } from '@/api-calls/users-api'
import { BASE_URL } from '@/lib/constants'
import BookmarksFeed from '@/components/BookmarksFeed'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10">
      <section className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <div className="flex flex-col">
          <BookmarksFeed username={self.username} />
        </div>
      </section>
    </div>
  )
}
