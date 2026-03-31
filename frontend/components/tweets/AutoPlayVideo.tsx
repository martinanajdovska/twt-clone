"use client"

import React, { useEffect, useRef } from "react"

type RegistryItem = {
  id: symbol
  getElement: () => HTMLVideoElement | null
  setShouldPlay: (shouldPlay: boolean) => void
}

const registry = new Map<symbol, RegistryItem>()
let listenersAttached = false
let rafScheduled = false

function isNearViewport(rect: DOMRect): boolean {
  return rect.bottom > -120 && rect.top < window.innerHeight + 120
}

function evaluateClosestVideo() {
  const viewportCenter = window.innerHeight / 2
  let bestId: symbol | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const item of registry.values()) {
    const el = item.getElement()
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (!isNearViewport(rect)) continue
    const centerY = rect.top + rect.height / 2
    const distance = Math.abs(centerY - viewportCenter)
    if (distance < bestDistance) {
      bestDistance = distance
      bestId = item.id
    }
  }

  for (const item of registry.values()) {
    item.setShouldPlay(item.id === bestId)
  }
}

function scheduleEvaluate() {
  if (rafScheduled) return
  rafScheduled = true
  window.requestAnimationFrame(() => {
    rafScheduled = false
    evaluateClosestVideo()
  })
}

function attachGlobalListeners() {
  if (listenersAttached) return
  listenersAttached = true
  window.addEventListener("scroll", scheduleEvaluate, { passive: true })
  window.addEventListener("resize", scheduleEvaluate)
  document.addEventListener("scroll", scheduleEvaluate, { passive: true, capture: true })
}

function detachGlobalListeners() {
  if (!listenersAttached || registry.size > 0) return
  listenersAttached = false
  window.removeEventListener("scroll", scheduleEvaluate)
  window.removeEventListener("resize", scheduleEvaluate)
  document.removeEventListener("scroll", scheduleEvaluate, true)
}

export default function AutoPlayVideo({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const idRef = useRef<symbol>(Symbol("auto-play-video"))

  useEffect(() => {
    attachGlobalListeners()

    const item: RegistryItem = {
      id: idRef.current,
      getElement: () => videoRef.current,
      setShouldPlay: (shouldPlay) => {
        const video = videoRef.current
        if (!video) return

        if (shouldPlay) {
          if (video.paused) {
            video.play().catch(() => {
            })
          }
        } else if (!video.paused) {
          video.pause()
        }
      },
    }

    registry.set(idRef.current, item)
    scheduleEvaluate()

    return () => {
      registry.delete(idRef.current)
      detachGlobalListeners()
      scheduleEvaluate()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      preload="metadata"
      className={className}
      onLoadedMetadata={scheduleEvaluate}
    />
  )
}
