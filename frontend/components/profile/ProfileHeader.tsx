'use client'

import Follow from '@/components/Follow'
import React, { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfileHeader } from '@/api-calls/users-api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEditProfilePicture } from '@/hooks/profile/useEditProfilePicture'
import { Camera, Loader2, MapPin, Link2, Cake, Calendar, Pencil } from 'lucide-react'
import type { IProfileHeader } from '@/DTO/IProfileHeader'
import EditProfileDialog from '@/components/profile/EditProfileDialog'

function formatJoined(iso: string): string {
  try {
    const d = new Date(iso)
    return `Joined ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  } catch {
    return ''
  }
}

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null
  try {
    const [y, m, d] = birthday.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return `Born ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  } catch {
    return birthday
  }
}

const ProfileHeader = ({
  username,
  token,
  isSelf,
}: {
  username: string
  token: string
  isSelf: boolean
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['profileHeader', username],
    queryFn: () => fetchProfileHeader({ username }),
  }) as { data?: IProfileHeader; isLoading: boolean }

  const { mutate: editProfilePicture, isPending } = useEditProfilePicture(username)

  if (isLoading) {
    return (
      <div className="bg-card border-x border-b border-border min-h-[280px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!data) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      const formData = new FormData()
      formData.append('image', file)
      editProfilePicture(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profileHeader', username] })
          setPreviewUrl(null)
        },
      })
    }
  }

  const triggerFileInput = () => {
    if (isSelf && !isPending) fileInputRef.current?.click()
  }

  const displayName = data.displayName?.trim() || username
  const joined = formatJoined(data.createdAt)
  const birthdayStr = formatBirthday(data.birthday)

  return (
    <div className="bg-card border-x border-b border-border shadow-sm overflow-hidden">
      {/* Banner */}
      <div
        className="h-[200px] w-full bg-muted/50 relative"
        style={
          data.bannerUrl
            ? { backgroundImage: `url(${data.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      />

      <div className="px-4 pb-4">
        {/* Avatar overlapping banner */}
        <div className="flex justify-between items-end -mt-16 relative">
          <div className="relative group">
            <div
              onClick={triggerFileInput}
              className={`relative h-32 w-32 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg shrink-0 ${isSelf ? 'cursor-pointer' : ''
                }`}
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={(previewUrl || data.imageUrl) ?? undefined} className="object-cover" />
                <AvatarFallback className="text-3xl bg-muted">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isSelf && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {isPending ? (
                    <Loader2 className="text-white animate-spin" size={28} />
                  ) : (
                    <Camera className="text-white" size={28} />
                  )}
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {isSelf ? (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-full border border-border px-4 py-2 font-bold text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          ) : (
            <div className="shrink-0">
              <Follow username={username} isFollowed={data.isFollowed} isFollowingYou={data.isFollowingYou} token={token} />
            </div>
          )}
        </div>

        {/* Name, handle, follows you */}
        <div className="mt-4 space-y-1">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-[15px]">@{username}</p>
          {data.isFollowingYou && !isSelf && (
            <p className="inline-block bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded font-medium">
              Follows you
            </p>
          )}
        </div>

        {/* Bio */}
        {data.bio != null && data.bio !== '' && (
          <p className="mt-3 text-[15px] text-foreground whitespace-pre-wrap break-words">
            {data.bio}
          </p>
        )}

        {/* Location, website, birthday, joined */}
        <div className="flex flex-wrap gap-4 mt-3 text-muted-foreground text-[15px]">
          {data.location != null && data.location !== '' && (
            <span className="flex items-center gap-1.5">
              <MapPin size={18} className="shrink-0" />
              <span>{data.location}</span>
            </span>
          )}
          {data.website != null && data.website !== '' && (
            <a
              href={data.website.startsWith('https') ? data.website : `https://${data.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <Link2 size={18} className="shrink-0" />
              <span className="truncate max-w-[200px]">{data.website.replace(/^https?:\/\//i, '')}</span>
            </a>
          )}
          {birthdayStr && (
            <span className="flex items-center gap-1.5">
              <Cake size={18} className="shrink-0" />
              <span>{birthdayStr}</span>
            </span>
          )}
          {joined && (
            <span className="flex items-center gap-1.5">
              <Calendar size={18} className="shrink-0" />
              <span>{joined}</span>
            </span>
          )}
        </div>

        {/* Following / Followers */}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            className="flex gap-1 items-center hover:underline text-foreground"
          >
            <span className="font-bold">{data.following}</span>
            <span className="text-muted-foreground text-[15px]">Following</span>
          </button>
          <button
            type="button"
            className="flex gap-1 items-center hover:underline text-foreground"
          >
            <span className="font-bold">{data.followers}</span>
            <span className="text-muted-foreground text-[15px]">Followers</span>
          </button>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        username={username}
        initialData={{
          displayName: data.displayName ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
          website: data.website ?? '',
          birthday: data.birthday ?? '',
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['profileHeader', username] })
          setEditOpen(false)
        }}
      />
    </div>
  )
}

export default ProfileHeader
