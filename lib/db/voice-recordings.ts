import { sql } from "@/lib/db"
import type { VoiceRecording, Language } from "@/lib/types"

function rowToRecording(row: Record<string, unknown>): VoiceRecording {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    sessionId: row.session_id as string | undefined,
    forgeResponseId: row.forge_response_id as string | undefined,
    language: row.language as Language,
    recordingUrl: row.recording_url as string | undefined,
    durationSeconds: row.duration_seconds ? Number(row.duration_seconds) : undefined,
    transcript: row.transcript as string | undefined,
    originalText: row.original_text as string | undefined,
    createdAt: new Date(row.created_at as string),
  }
}

export async function createVoiceRecording(data: {
  userId: string
  sessionId?: string
  forgeResponseId?: string
  language: Language
  recordingUrl?: string
  durationSeconds?: number
  transcript?: string
  originalText?: string
}): Promise<VoiceRecording> {
  const result = await sql`
    INSERT INTO voice_recordings (
      user_id, session_id, forge_response_id, language,
      recording_url, duration_seconds, transcript, original_text
    )
    VALUES (
      ${data.userId}, ${data.sessionId || null}, ${data.forgeResponseId || null},
      ${data.language}, ${data.recordingUrl || null}, ${data.durationSeconds || null},
      ${data.transcript || null}, ${data.originalText || null}
    )
    RETURNING *
  `
  return rowToRecording(result[0])
}

export async function getVoiceRecordings(
  userId: string,
  options?: {
    language?: Language
    sessionId?: string
    limit?: number
  }
): Promise<VoiceRecording[]> {
  const limit = options?.limit ?? 50

  if (options?.sessionId) {
    const result = await sql`
      SELECT * FROM voice_recordings
      WHERE user_id = ${userId} AND session_id = ${options.sessionId}
      ORDER BY created_at DESC
    `
    return result.map(rowToRecording)
  }

  if (options?.language) {
    const result = await sql`
      SELECT * FROM voice_recordings
      WHERE user_id = ${userId} AND language = ${options.language}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToRecording)
  }

  const result = await sql`
    SELECT * FROM voice_recordings
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result.map(rowToRecording)
}

export async function getVoiceRecordingStats(userId: string): Promise<{
  totalRecordings: number
  totalDurationMinutes: number
  byLanguage: Record<string, number>
}> {
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COALESCE(SUM(duration_seconds), 0) as total_duration,
      language,
      COUNT(*) as lang_count
    FROM voice_recordings
    WHERE user_id = ${userId}
    GROUP BY language
  `
  
  const byLanguage: Record<string, number> = {}
  let totalRecordings = 0
  let totalDuration = 0
  
  for (const row of result) {
    byLanguage[row.language as string] = Number(row.lang_count)
    totalRecordings += Number(row.lang_count)
    totalDuration += Number(row.total_duration)
  }
  
  return {
    totalRecordings,
    totalDurationMinutes: Math.round(totalDuration / 60),
    byLanguage
  }
}
