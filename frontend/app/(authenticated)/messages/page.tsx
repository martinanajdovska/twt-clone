import { Suspense } from 'react'
import MessagesPage from '@/components/messages/MessagesPage'

export default function MessagesRoute() {
  return (
    <div className="flex flex-col min-h-screen h-screen">
      <Suspense fallback={<div className="flex items-center justify-center py-24 text-muted-foreground">Loading...</div>}>
        <MessagesPage />
      </Suspense>
    </div>
  )
}
