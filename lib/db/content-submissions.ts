import { sql } from "@/lib/db"
import type { ContentSubmission, Language, ContentType, SubmissionStatus } from "@/lib/types"

function rowToSubmission(row: Record<string, unknown>): ContentSubmission {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as ContentType,
    language: row.language as Language,
    title: row.title as string,
    description: row.description as string | undefined,
    sourceUrl: row.source_url as string | undefined,
    difficulty: row.difficulty ? Number(row.difficulty) : undefined,
    topics: row.topics as string[],
    status: row.status as SubmissionStatus,
    moderatorId: row.moderator_id as string | undefined,
    moderatorNotes: row.moderator_notes as string | undefined,
    autoFlags: row.auto_flags as string[],
    createdAt: new Date(row.created_at as string),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : undefined,
  }
}

// Auto-flagging rules
const FLAG_PATTERNS = {
  spam: [
    /\b(buy now|click here|free money|earn \$\$\$)\b/i,
    /(.)\1{5,}/, // Repeated characters
  ],
  inappropriate: [
    // Add patterns for inappropriate content
  ],
  lowQuality: [
    /^.{0,20}$/, // Too short
  ],
  duplicateUrl: async (url: string, language: Language) => {
    const existing = await sql`
      SELECT id FROM content_items WHERE source_url = ${url} AND language = ${language}
      UNION
      SELECT id FROM content_submissions WHERE source_url = ${url} AND language = ${language}
    `
    return existing.length > 0
  }
}

async function autoFlag(submission: {
  title: string
  description?: string
  sourceUrl?: string
  language: Language
}): Promise<string[]> {
  const flags: string[] = []
  const textToCheck = `${submission.title} ${submission.description || ''}`

  // Check spam patterns
  for (const pattern of FLAG_PATTERNS.spam) {
    if (pattern.test(textToCheck)) {
      flags.push('spam')
      break
    }
  }

  // Check low quality
  if (submission.title.length < 10) {
    flags.push('low_quality_title')
  }

  // Check for duplicate URL
  if (submission.sourceUrl) {
    const isDuplicate = await FLAG_PATTERNS.duplicateUrl(submission.sourceUrl, submission.language)
    if (isDuplicate) {
      flags.push('duplicate_url')
    }
  }

  return flags
}

export async function createSubmission(data: {
  userId: string
  type: ContentType
  language: Language
  title: string
  description?: string
  sourceUrl?: string
  difficulty?: number
  topics?: string[]
}): Promise<ContentSubmission> {
  // Run auto-flagging
  const autoFlags = await autoFlag({
    title: data.title,
    description: data.description,
    sourceUrl: data.sourceUrl,
    language: data.language
  })

  // Set status based on flags
  const status = autoFlags.length > 0 ? 'flagged' : 'pending'

  const result = await sql`
    INSERT INTO content_submissions (
      user_id, type, language, title, description, source_url,
      difficulty, topics, status, auto_flags
    )
    VALUES (
      ${data.userId}, ${data.type}, ${data.language}, ${data.title},
      ${data.description || null}, ${data.sourceUrl || null},
      ${data.difficulty || null}, ${data.topics || []}, ${status}, ${autoFlags}
    )
    RETURNING *
  `

  return rowToSubmission(result[0])
}

export async function getSubmissions(options?: {
  status?: SubmissionStatus
  language?: Language
  userId?: string
  limit?: number
}): Promise<ContentSubmission[]> {
  const limit = options?.limit ?? 50

  if (options?.status && options?.language) {
    const result = await sql`
      SELECT * FROM content_submissions
      WHERE status = ${options.status} AND language = ${options.language}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToSubmission)
  }

  if (options?.status) {
    const result = await sql`
      SELECT * FROM content_submissions
      WHERE status = ${options.status}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToSubmission)
  }

  if (options?.userId) {
    const result = await sql`
      SELECT * FROM content_submissions
      WHERE user_id = ${options.userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.map(rowToSubmission)
  }

  const result = await sql`
    SELECT * FROM content_submissions
    ORDER BY 
      CASE status 
        WHEN 'flagged' THEN 1 
        WHEN 'pending' THEN 2 
        ELSE 3 
      END,
      created_at DESC
    LIMIT ${limit}
  `
  return result.map(rowToSubmission)
}

export async function reviewSubmission(data: {
  submissionId: string
  moderatorId: string
  status: 'approved' | 'rejected'
  notes?: string
}): Promise<ContentSubmission> {
  const result = await sql`
    UPDATE content_submissions
    SET 
      status = ${data.status},
      moderator_id = ${data.moderatorId},
      moderator_notes = ${data.notes || null},
      reviewed_at = NOW()
    WHERE id = ${data.submissionId}
    RETURNING *
  `

  const submission = rowToSubmission(result[0])

  // If approved, create the content item
  if (data.status === 'approved') {
    await sql`
      INSERT INTO content_items (
        type, language, title, description, source_url,
        difficulty, topics
      )
      SELECT 
        type, language, title, description, source_url,
        COALESCE(difficulty, 3), topics
      FROM content_submissions
      WHERE id = ${data.submissionId}
    `
  }

  return submission
}

export async function getModeratorStats(moderatorId: string): Promise<{
  totalReviewed: number
  approved: number
  rejected: number
  thisWeek: number
}> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE reviewed_at > ${weekAgo.toISOString()}) as this_week
    FROM content_submissions
    WHERE moderator_id = ${moderatorId}
  `

  const stats = result[0]
  return {
    totalReviewed: Number(stats.total) || 0,
    approved: Number(stats.approved) || 0,
    rejected: Number(stats.rejected) || 0,
    thisWeek: Number(stats.this_week) || 0
  }
}

export async function getSubmissionStats(): Promise<{
  pending: number
  flagged: number
  approved: number
  rejected: number
  byLanguage: Record<string, number>
}> {
  const result = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'flagged') as flagged,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected
    FROM content_submissions
  `

  const langResult = await sql`
    SELECT language, COUNT(*) as count
    FROM content_submissions
    WHERE status IN ('pending', 'flagged')
    GROUP BY language
  `

  const byLanguage: Record<string, number> = {}
  for (const row of langResult) {
    byLanguage[row.language as string] = Number(row.count)
  }

  const stats = result[0]
  return {
    pending: Number(stats.pending) || 0,
    flagged: Number(stats.flagged) || 0,
    approved: Number(stats.approved) || 0,
    rejected: Number(stats.rejected) || 0,
    byLanguage
  }
}
