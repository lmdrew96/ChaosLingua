"use client"

import useSWR from "swr"
import type { ForgeType, Language } from "@/lib/types"

export interface ForgePrompt {
  id: string
  type: ForgeType
  language: Language
  text: string
  difficulty: number
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch forge prompts")
  }
  return res.json()
}

export function useForgePrompts(options?: {
  type?: ForgeType
  language?: Language
  limit?: number
  random?: boolean
}) {
  const params = new URLSearchParams()
  if (options?.type) params.set("type", options.type)
  if (options?.language) params.set("language", options.language)
  if (options?.limit) params.set("limit", options.limit.toString())
  if (options?.random) params.set("random", "true")

  const queryString = params.toString()
  const url = `/api/forge/prompts${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<ForgePrompt[]>(
    options ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    prompts: data || [],
    isLoading,
    error,
    mutate,
  }
}
