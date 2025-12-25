"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import type { UserProfile, UserStats } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth()

  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    isAuthenticated ? "/api/user/profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )

  // Merge user data with profile
  const profile = data
    ? {
        ...data,
        name: user?.display_name || "Explorer",
      }
    : null

  return {
    profile,
    isLoading,
    error,
    mutate,
  }
}

export function useUserStats() {
  const { isAuthenticated } = useAuth()

  const { data, error, isLoading, mutate } = useSWR<UserStats>(isAuthenticated ? "/api/user/stats" : null, fetcher, {
    revalidateOnFocus: false,
  })

  const incrementStats = async (increments: Partial<UserStats>) => {
    await fetch("/api/user/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(increments),
    })
    mutate()
  }

  return {
    stats: data || {
      chaosSessions: 0,
      errorsHarvested: 0,
      mysteriesResolved: 0,
      timeInFog: 0,
      wordsForged: 0,
      currentStreak: 0,
    },
    isLoading,
    error,
    mutate,
    incrementStats,
  }
}
