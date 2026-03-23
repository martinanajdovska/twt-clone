import { X } from 'lucide-react'
import { PollDurationPicker } from './PollDurationPicker'

export default function PollForm({
  pollOptions,
  pollDurationMinutes,
  pollDurationHours,
  pollDurationDays,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onMinutesChange,
  onHoursChange,
  onDaysChange,
}: {
  pollOptions: string[]
  pollDurationMinutes: number
  pollDurationHours: number
  pollDurationDays: number
  onOptionChange: (index: number, value: string) => void
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onMinutesChange: (minutes: number) => void
  onHoursChange: (hours: number) => void
  onDaysChange: (days: number) => void
}) {
  return (
    <div className="mt-3 p-3 rounded-2xl border border-border space-y-3">
      {pollOptions.map((value, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={`Choice ${i + 1}`}
            value={value}
            maxLength={25}
            onChange={(e) => onOptionChange(i, e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {pollOptions.length > 2 && (
            <button type="button" onClick={() => onRemoveOption(i)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-full">
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      {pollOptions.length < 4 && (
        <button type="button" onClick={onAddOption} className="text-sm text-primary hover:underline">
          Add option
        </button>
      )}
      <PollDurationPicker
        minutes={pollDurationMinutes}
        hours={pollDurationHours}
        days={pollDurationDays}
        onMinutesChange={onMinutesChange}
        onHoursChange={onHoursChange}
        onDaysChange={onDaysChange}
      />
    </div>
  )
}
