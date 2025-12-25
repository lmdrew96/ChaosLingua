"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import type { MysteryItem, Language } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMysteries(options?: { language?: Language; resolved?: boolean }) {
  const { isAuthenticated } = useAuth()

  const params = new URLSearchParams()
  if (options?.language) params.set("language", options.language)
  if (options?.resolved !== undefined) params.set("resolved", String(options.resolved))

  const url = isAuthenticated ? `/api/mysteries${params.toString() ? `?${params.toString()}` : ""}` : null

  const { data, error, isLoading, mutate } = useSWR<MysteryItem[]>(url, fetcher, {
    revalidateOnFocus: false,
  })

  const addMystery = async (input: { language: Language; phrase: string; context?: string }) => {
    await fetch("/api/mysteries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    mutate()
  }

  const resolveMystery = async (mysteryId: string, meaning: string) => {
    await fetch("/api/mysteries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mysteryId, meaning }),
    })
    mutate()
  }

  return {
    mysteries: data || [],
    isLoading,
    error,
    mutate,
    addMystery,
    resolveMystery,
  }
}
