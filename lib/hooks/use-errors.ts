"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import type { ErrorItem, ErrorType, Language } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useErrors(options?: { language?: Language; type?: ErrorType }) {
  const { isAuthenticated } = useAuth()

  const params = new URLSearchParams()
  if (options?.language) params.set("language", options.language)
  if (options?.type) params.set("type", options.type)

  const url = isAuthenticated ? `/api/errors${params.toString() ? `?${params.toString()}` : ""}` : null

  const { data, error, isLoading, mutate } = useSWR<{
    errors: ErrorItem[]
    stats: { total: number; byType: Record<ErrorType, number>; byLanguage: Record<Language, number> }
  }>(url, fetcher, {
    revalidateOnFocus: false,
  })

  const addError = async (input: {
    type: ErrorType
    language: Language
    original: string
    userGuess?: string
    correct: string
    context?: string
  }) => {
    await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    mutate()
  }

  return {
    errors: data?.errors || [],
    stats: data?.stats || { total: 0, byType: {}, byLanguage: {} },
    isLoading,
    error,
    mutate,
    addError,
  }
}
