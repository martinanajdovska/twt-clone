'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateProfile, updateProfileImage } from '@/api-calls/users-api'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import type { IProfileHeader } from '@/DTO/IProfileHeader'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  initialData: {
    imageUrl: string
    displayName: string
    bio: string
    location: string
    website: string
    birthday: string
  }
  onSuccess: () => void
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  username,
  initialData,
  onSuccess,
}: Props) {
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [bio, setBio] = useState(initialData.bio)
  const [location, setLocation] = useState(initialData.location)
  const [website, setWebsite] = useState(initialData.website)
  const [birthday, setBirthday] = useState(initialData.birthday)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (open) {
      setDisplayName(initialData.displayName)
      setBio(initialData.bio)
      setLocation(initialData.location)
      setWebsite(initialData.website)
      setBirthday(initialData.birthday)
      setBannerFile(null)
      setBannerPreview(null)
      setImageFile(null)
      setImagePreview(null)
      setError(null)
    }
  }, [open, initialData])

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    } else {
      setBannerFile(null)
      setBannerPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedDisplayName = displayName.trim()
    const normalizedBio = bio.trim()
    const normalizedLocation = location.trim()
    const normalizedWebsite = website.trim()

    if (normalizedDisplayName.length > 50) return setError('Display name must be at most 50 characters')
    if (normalizedBio.length > 160) return setError('Bio must be at most 160 characters')
    if (normalizedLocation.length > 100) return setError('Location must be at most 100 characters')
    if (normalizedWebsite.length > 100) return setError('Website must be at most 100 characters')
    if (birthday) {
      const selected = new Date(birthday)
      const today = new Date()
      selected.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      if (selected > today) return setError('Birth date cannot be in the future')
    }

    setError(null)
    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append('bio', normalizedBio)
      formData.append('location', normalizedLocation)
      formData.append('website', normalizedWebsite)
      formData.append('birthday', birthday)
      formData.append('displayName', normalizedDisplayName)

      if (bannerFile) formData.append('banner', bannerFile)
      if (imageFile) {
        const imageForm = new FormData()
        imageForm.append('image', imageFile)
        await updateProfileImage(imageForm)
      }
      const data = await updateProfile(formData)
      queryClient.setQueryData<IProfileHeader>(
        ['profileHeader', username],
        (old) =>
          old
            ? {
                ...old,
                ...data,
                imageUrl: imagePreview || old.imageUrl,
              }
            : old
      )
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Profile photo
            </label>
            <div
              className="h-24 w-24 rounded-full border border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              {imagePreview || initialData.imageUrl ? (
                <img
                  src={imagePreview || initialData.imageUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs">Upload</span>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  setImagePreview(URL.createObjectURL(file))
                } else {
                  setImageFile(null)
                  setImagePreview(null)
                }
              }}
              className="hidden"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Header photo
            </label>
            <div
              className="h-32 w-full rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Click to upload</span>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>

          <div>
            <label htmlFor="edit-displayName" className="text-sm font-medium text-foreground block mb-1.5">
              Name
            </label>
            <input
              id="edit-displayName"
              type="text"
              maxLength={50}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="Name"
            />
          </div>

          <div>
            <label htmlFor="edit-bio" className="text-sm font-medium text-foreground block mb-1.5">
              Bio
            </label>
            <textarea
              id="edit-bio"
              maxLength={160}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Add a bio"
            />
            <p className="text-muted-foreground text-xs mt-1">{bio.length}/160</p>
          </div>

          <div>
            <label htmlFor="edit-location" className="text-sm font-medium text-foreground block mb-1.5">
              Location
            </label>
            <input
              id="edit-location"
              type="text"
              maxLength={100}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="Location"
            />
            <p className="text-muted-foreground text-xs mt-1">{location.length}/100</p>
          </div>

          <div>
            <label htmlFor="edit-website" className="text-sm font-medium text-foreground block mb-1.5">
              Website
            </label>
            <input
              id="edit-website"
              type="text"
              maxLength={100}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://example.com"
            />
            <p className="text-muted-foreground text-xs mt-1">{website.length}/100</p>
          </div>

          <div>
            <label htmlFor="edit-birthday" className="text-sm font-medium text-foreground block mb-1.5">
              Birth date
            </label>
            <input
              id="edit-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2 font-bold text-sm hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-foreground text-background px-4 py-2 font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
