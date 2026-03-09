import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchSelfUsernameAndProfilePicture } from '@/api-calls/users-api'
import { BASE_URL } from '@/lib/constants'
import NotificationsPage from '@/components/notifications/NotificationsPage'

export default async function NotificationsRoute() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    await fetchSelfUsernameAndProfilePicture({ token })
  } catch {
    redirect(`${BASE_URL}/api/auth/clear-session`)
  }

  return <NotificationsPage />
}
