import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchSelfUsernameAndProfilePicture } from '@/api-calls/users-api'
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
    redirect('/api/auth/clear-session')
  }

  return <NotificationsPage />
}
