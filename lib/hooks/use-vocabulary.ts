"use client"

import useSWR from "swr"

interface ProductionGapData {
  comprehension: number
  production: number
  wordsRecognized: number
  wordsProduced: number
  gapWords: string[]
}

interface VocabularyStats {
  totalRecognized: number
  totalProduced: number
  averageRecognitionStrength: number
  averageProductionStrength: number
  recentlyLearnedCount: number
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch vocabulary data")
  }
  return res.json()
}

export function useProductionGap(language?: "ro" | "ko") {
  const { data, error, isLoading, mutate } = useSWR<ProductionGapData>(
    language ? `/api/vocabulary?type=gap&language=${language}` : "/api/vocabulary?type=gap",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      fallbackData: {
        comprehension: 0,
        production: 0,
        wordsRecognized: 0,
        wordsProduced: 0,
        gapWords: [],
      },
    }
  )

  return {
    gap: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useVocabularyStats(language?: "ro" | "ko") {
  const { data, error, isLoading, mutate } = useSWR<VocabularyStats>(
    language ? `/api/vocabulary?type=stats&language=${language}` : "/api/vocabulary?type=stats",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useRecordVocabulary() {
  const recordRecognition = async (word: string, language: "ro" | "ko", context?: string) => {
    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "recognition",
        word,
        language,
        context,
      }),
    })
    return res.ok
  }

  const recordProduction = async (
    word: string,
    language: "ro" | "ko",
    context?: string,
    accuracy?: number
  ) => {
    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "production",
        word,
        language,
        context,
        accuracy,
      }),
    })
    return res.ok
  }

  return {
    recordRecognition,
    recordProduction,
  }
}
