"use client"

import useSWR from "swr"
import type { ContentItem, Language, ContentType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useContent(options?: {
  language?: Language
  type?: ContentType
  limit?: number
  random?: boolean
}) {
  const params = new URLSearchParams()
  if (options?.language) params.set("language", options.language)
  if (options?.type) params.set("type", options.type)
  if (options?.limit) params.set("limit", options.limit.toString())
  if (options?.random) params.set("random", "true")

  const queryString = params.toString()
  const url = `/api/content${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<ContentItem[]>(url, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    content: data || [],
    isLoading,
    error,
    mutate,
  }
}
