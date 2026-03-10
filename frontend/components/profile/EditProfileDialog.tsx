'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateProfile } from '@/api-calls/users-api'
import { Loader2 } from 'lucide-react'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  initialData: {
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
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setDisplayName(initialData.displayName)
      setBio(initialData.bio)
      setLocation(initialData.location)
      setWebsite(initialData.website)
      setBirthday(initialData.birthday)
      setBannerFile(null)
      setBannerPreview(null)
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
    setError(null)
    if (birthday) {
      const birthDate = new Date(birthday)
      birthDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (birthDate > today) {
        setError('Birth date cannot be in the future')
        return
      }
    }
    const lengthErrors: string[] = []
    if (bio.length > 160) lengthErrors.push('Bio (max 160 characters)')
    if (location.length > 100) lengthErrors.push('Location (max 100 characters)')
    if (website.length > 100) lengthErrors.push('Website (max 100 characters)')
    if (displayName.length > 50) lengthErrors.push('Name (max 50 characters)')
    if (lengthErrors.length > 0) {
      setError(`${lengthErrors.join(', ')} exceeded`)
      return
    }
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('bio', bio)
      formData.append('location', location)
      formData.append('website', website)
      formData.append('birthday', birthday || '')
      formData.append('displayName', displayName)
      if (bannerFile) formData.append('banner', bannerFile)
      await updateProfile(formData)
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
