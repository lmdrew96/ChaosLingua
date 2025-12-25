import { sql } from "@/lib/db"
import type { Language } from "@/lib/types"

export interface Definition {
  id: string
  language: Language
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
}

// Get definition for a word
export async function getDefinition(word: string, language: Language): Promise<Definition | null> {
  const result = await sql`
    SELECT * FROM definitions
    WHERE word = ${word} AND language = ${language}
    LIMIT 1
  `

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    language: row.language,
    word: row.word,
    definition: row.definition,
    partOfSpeech: row.part_of_speech || undefined,
    examples: row.examples || undefined,
  }
}

// Search definitions by prefix
export async function searchDefinitions(
  query: string,
  language: Language,
  limit = 10
): Promise<Definition[]> {
  const result = await sql`
    SELECT * FROM definitions
    WHERE language = ${language} AND word ILIKE ${query + '%'}
    ORDER BY word
    LIMIT ${limit}
  `

  return result.map((row) => ({
    id: row.id,
    language: row.language,
    word: row.word,
    definition: row.definition,
    partOfSpeech: row.part_of_speech || undefined,
    examples: row.examples || undefined,
  }))
}

// Add or update a definition
export async function upsertDefinition(input: {
  language: Language
  word: string
  definition: string
  partOfSpeech?: string
  examples?: string[]
}): Promise<Definition> {
  const result = await sql`
    INSERT INTO definitions (language, word, definition, part_of_speech, examples)
    VALUES (${input.language}, ${input.word}, ${input.definition}, ${input.partOfSpeech || null}, ${input.examples || null})
    ON CONFLICT (language, word) DO UPDATE SET
      definition = EXCLUDED.definition,
      part_of_speech = EXCLUDED.part_of_speech,
      examples = EXCLUDED.examples
    RETURNING *
  `

  const row = result[0]
  return {
    id: row.id,
    language: row.language,
    word: row.word,
    definition: row.definition,
    partOfSpeech: row.part_of_speech || undefined,
    examples: row.examples || undefined,
  }
}
