'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { searchGifs, type Gif } from '@/api-calls/klipy-api'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function GifPicker({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Gif[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setItems([])
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    searchGifs('', 24)
      .then((res: Gif[]) => {
        if (!cancelled) setItems(res)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load GIFs')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!open) return
    setLoading(true)
    setError(null)
    searchGifs(query, 24)
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to search'))
      .finally(() => setLoading(false))
  }

  const handleSelect = (gif: Gif) => {
    onSelect(gif.mediumGifUrl || gif.tinyGifUrl)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col" showCloseButton>
        <DialogHeader>
          <DialogTitle>Choose a GIF</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search GIFs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}
          {error && !loading && (
            <p className="text-center text-destructive text-sm py-8">{error}</p>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="relative aspect-square rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleSelect(item)}
                >
                  <Image
                    src={item.tinyGifUrl || item.mediumGifUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
