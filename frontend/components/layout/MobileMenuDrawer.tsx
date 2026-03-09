'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { User as UserIcon, Bookmark } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { fetchProfileHeader } from '@/api-calls/users-api'
import type { IProfileHeader } from '@/DTO/IProfileHeader'
import Logout from '@/components/auth/Logout'
import { ModeToggle } from '@/components/ui/ModeToggle'

export default function MobileMenuDrawer({
  username,
  profilePicture,
}: {
  username: string
  profilePicture: string | null
}) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<IProfileHeader | null>(null)

  useEffect(() => {
    if (!open || !username) return
    fetchProfileHeader({ username })
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [open, username])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center rounded-full p-1 hover:bg-accent transition-colors -ml-1"
          aria-label="Open menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profilePicture ?? undefined} className="object-cover" />
            <AvatarFallback className="bg-muted text-foreground font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="!fixed !left-0 !top-0 !h-full w-[min(85vw,280px)] max-w-[280px] !translate-x-0 !translate-y-0 rounded-none border-0 border-r border-border transition-transform duration-200 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      >
        <div className="flex flex-col h-full pt-6 pb-8">
          <DialogTitle className="sr-only">Account menu</DialogTitle>
          <div className="px-4 pb-4 border-b border-border">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={profilePicture ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-muted text-2xl font-bold text-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-bold text-foreground text-lg leading-tight">{username}</p>
            <p className="text-muted-foreground text-[15px]">@{username.toLowerCase()}</p>
            {profile != null && (
              <div className="flex gap-4 mt-2 text-[15px]">
                <span className="text-foreground font-bold">{profile.following}</span>
                <span className="text-muted-foreground">Following</span>
                <span className="text-foreground font-bold">{profile.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
            )}
          </div>
          <nav className="flex flex-col gap-1 px-2 pt-4">
            <Link
              href={`/users/${username}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-full hover:bg-accent transition-colors text-[19px] font-normal text-foreground"
            >
              <UserIcon size={26} strokeWidth={1.5} />
              Profile
            </Link>
            <Link
              href="/bookmarks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-full hover:bg-accent transition-colors text-[19px] font-normal text-foreground"
            >
              <Bookmark size={26} strokeWidth={1.5} />
              Bookmarks
            </Link>
            <ModeToggle label="Theme" className="w-full text-left" />
            <Logout alwaysShowLabel />
          </nav>
        </div>
      </DialogContent>
    </Dialog>
  )
}
