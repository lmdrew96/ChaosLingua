"use client"

import useSWR from "swr"
import { useCallback } from "react"

interface User {
  id: string
  email: string
  display_name: string | null
}

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      // Return null user instead of throwing to prevent SWR retry loops
      return { user: null }
    }
    return res.json()
  } catch {
    // Network error - return null user
    return { user: null }
  }
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ user: User | null }>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
  })

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Sign in failed")
      }

      await mutate()
      return responseData.user
    },
    [mutate],
  )

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Sign up failed")
      }

      await mutate()
      return responseData.user
    },
    [mutate],
  )

  const signOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST" })
    await mutate({ user: null }, false)
  }, [mutate])

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    signIn,
    signUp,
    signOut,
    mutate,
  }
}
