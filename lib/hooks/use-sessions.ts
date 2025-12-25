"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import type { Session, SessionType, SessionMood, Language } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSessions(options?: { type?: SessionType; language?: Language; limit?: number }) {
  const { isAuthenticated } = useAuth()

  const params = new URLSearchParams()
  if (options?.type) params.set("type", options.type)
  if (options?.language) params.set("language", options.language)
  if (options?.limit) params.set("limit", String(options.limit))

  const url = isAuthenticated ? `/api/sessions${params.toString() ? `?${params.toString()}` : ""}` : null

  const { data, error, isLoading, mutate } = useSWR<{
    sessions: Session[]
    stats: {
      totalSessions: number
      totalDuration: number
      byType: Record<SessionType, number>
      recentMoods: SessionMood[]
    }
  }>(url, fetcher, {
    revalidateOnFocus: false,
  })

  const startSession = async (input: { type: SessionType; language: Language }) => {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const session = await response.json()
    mutate()
    return session as Session
  }

  const endSession = async (sessionId: string, data: { duration: number; reflection?: string; mood?: SessionMood }) => {
    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...data }),
    })
    mutate()
  }

  return {
    sessions: data?.sessions || [],
    stats: data?.stats || { totalSessions: 0, totalDuration: 0, byType: {}, recentMoods: [] },
    isLoading,
    error,
    mutate,
    startSession,
    endSession,
  }
}
