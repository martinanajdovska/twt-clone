import { ImageIcon, Video, BarChart3 } from 'lucide-react'

const MAX_TWEET_LENGTH = 280

export default function TweetFormToolbar({
  content,
  isPending,
  canSubmit,
  canAddPoll,
  showPoll,
  hasGif,
  onTogglePoll,
  onFileClick,
  onVideoClick,
  fileInputRef,
  videoInputRef,
  onFileChange,
  onVideoChange,
  onGifClick,
}: {
  content: string
  isPending: boolean
  canSubmit: boolean
  canAddPoll: boolean
  showPoll: boolean
  hasGif?: boolean
  onTogglePoll: () => void
  onFileClick: () => void
  onVideoClick: () => void
  fileInputRef: React.RefObject<HTMLInputElement> | null
  videoInputRef: React.RefObject<HTMLInputElement> | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGifClick?: () => void
}) {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <div className="flex items-center gap-1 text-primary">
        <button type="button" onClick={onFileClick} className="p-2 hover:bg-primary/10 rounded-full transition-colors" disabled={!!hasGif}>
          <ImageIcon size={20} />
        </button>
        <button type="button" onClick={onVideoClick} className="p-2 hover:bg-primary/10 rounded-full transition-colors" disabled={!!hasGif}>
          <Video size={20} />
        </button>
        {onGifClick && (
          <button type="button" onClick={onGifClick} className="p-2 hover:bg-primary/10 rounded-full transition-colors" disabled={isPending}>
            <span className="text-base font-bold leading-none">GIF</span>
          </button>
        )}
        {canAddPoll && (
          <button type="button" onClick={onTogglePoll} className={`p-2 rounded-full transition-colors ${showPoll ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10'}`}>
            <BarChart3 size={20} />
          </button>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
        <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={onVideoChange} />
      </div>
      <div className="flex items-center gap-4">
        {content.length > 0 && (
          <span className={`text-sm tabular-nums ${content.length > MAX_TWEET_LENGTH ? 'text-destructive font-bold' : content.length >= MAX_TWEET_LENGTH - 20 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {content.length}/{MAX_TWEET_LENGTH}
          </span>
        )}
        <button type="submit" disabled={isPending || !canSubmit} className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-50">
          {isPending ? 'Sending...' : 'Tweet'}
        </button>
      </div>
    </div>
  )
}