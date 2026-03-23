'use client'

import { IPollDurationPickerProps } from '@/DTO/IPollDurationPickerProps'
import React, { useRef, useEffect } from 'react'

const ITEM_HEIGHT = 44
const VISIBLE_HEIGHT = ITEM_HEIGHT * 3
const PADDING_V = ITEM_HEIGHT

const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 8 }, (_, i) => i)


function useWheelScroll(
  ref: React.RefObject<HTMLDivElement | null>,
  value: number,
  items: number[],
  onSelect: (value: number) => void,
) {
  const scrollToIndex = (index: number) => {
    const el = ref.current
    if (!el) return
    const offset = PADDING_V + index * ITEM_HEIGHT - (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2
    el.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    const y = el.scrollTop
    const index = Math.round((y - PADDING_V + (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2) / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(index, items.length - 1))
    onSelect(items[clamped])
  }

  return { scrollToIndex, handleScroll }
}

export function PollDurationPicker({
  minutes,
  hours,
  days,
  onMinutesChange,
  onHoursChange,
  onDaysChange,
}: IPollDurationPickerProps) {
  const minutesRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)

  const clampedMinutes = Math.max(0, Math.min(59, minutes))
  const clampedHours = Math.max(0, Math.min(23, hours))
  const clampedDays = Math.max(0, Math.min(7, days))

  const min = useWheelScroll(minutesRef, clampedMinutes, MINUTES, onMinutesChange)
  const hr = useWheelScroll(hoursRef, clampedHours, HOURS, onHoursChange)
  const d = useWheelScroll(daysRef, clampedDays, DAYS, onDaysChange)


  useEffect(() => {
    const i = MINUTES.indexOf(clampedMinutes)
    if (i >= 0) min.scrollToIndex(i)
  }, [clampedMinutes])
  useEffect(() => {
    const i = HOURS.indexOf(clampedHours)
    if (i >= 0) hr.scrollToIndex(i)
  }, [clampedHours])
  useEffect(() => {
    const i = DAYS.indexOf(clampedDays)
    if (i >= 0) d.scrollToIndex(i)
  }, [clampedDays])

  return (
    <div className="border-t border-border pt-3 mt-1">
      <p className="text-sm font-medium text-muted-foreground mb-2">Duration</p>
      <div className="flex gap-3 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground mb-1.5">Minutes</span>
          <div
            className="w-14 rounded-xl border border-border overflow-hidden relative"
            style={{ height: VISIBLE_HEIGHT }}
          >
            <div
              ref={minutesRef}
              className="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={min.handleScroll}
            >
              <div style={{ paddingTop: PADDING_V, paddingBottom: PADDING_V }}>
                {MINUTES.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-center font-semibold text-foreground snap-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute left-0 right-0 border-y border-border pointer-events-none bg-transparent"
              style={{
                top: (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2,
                height: ITEM_HEIGHT,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground mb-1.5">Hours</span>
          <div
            className="w-14 rounded-xl border border-border overflow-hidden relative"
            style={{ height: VISIBLE_HEIGHT }}
          >
            <div
              ref={hoursRef}
              className="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={hr.handleScroll}
            >
              <div style={{ paddingTop: PADDING_V, paddingBottom: PADDING_V }}>
                {HOURS.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-center font-semibold text-foreground snap-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute left-0 right-0 border-y border-border pointer-events-none bg-transparent"
              style={{
                top: (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2,
                height: ITEM_HEIGHT,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground mb-1.5">Days</span>
          <div
            className="w-14 rounded-xl border border-border overflow-hidden relative"
            style={{ height: VISIBLE_HEIGHT }}
          >
            <div
              ref={daysRef}
              className="overflow-y-auto overflow-x-hidden h-full snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={d.handleScroll}
            >
              <div style={{ paddingTop: PADDING_V, paddingBottom: PADDING_V }}>
                {DAYS.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-center font-semibold text-foreground snap-center"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute left-0 right-0 border-y border-border pointer-events-none bg-transparent"
              style={{
                top: (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2,
                height: ITEM_HEIGHT,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
