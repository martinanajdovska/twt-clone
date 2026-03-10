import { X } from 'lucide-react'

const POLL_DURATIONS = [
    { label: '1 hour', hours: 1 },
    { label: '3 hours', hours: 3 },
    { label: '6 hours', hours: 6 },
    { label: '12 hours', hours: 12 },
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '7 days', hours: 168 },
]

export default function PollForm({ pollOptions, pollDurationHours, onOptionChange, onAddOption, onRemoveOption, onDurationChange }: {
    pollOptions: string[]
    pollDurationHours: number
    onOptionChange: (index: number, value: string) => void
    onAddOption: () => void
    onRemoveOption: (index: number) => void
    onDurationChange: (hours: number) => void
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
            <div className="flex items-center gap-2 pt-1">
                <label className="text-sm text-muted-foreground">Duration:</label>
                <select
                    value={pollDurationHours}
                    onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {POLL_DURATIONS.map(d => <option key={d.hours} value={d.hours}>{d.label}</option>)}
                </select>
            </div>
        </div>
    )
}