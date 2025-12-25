import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  createSubmission, 
  getSubmissions, 
  reviewSubmission,
  getSubmissionStats 
} from "@/lib/db/content-submissions"
import type { Language, ContentType, SubmissionStatus } from "@/lib/types"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as SubmissionStatus | null
  const language = searchParams.get("language") as Language | null
  const mySubmissions = searchParams.get("my") === "true"
  const stats = searchParams.get("stats") === "true"

  if (stats) {
    const submissionStats = await getSubmissionStats()
    return NextResponse.json(submissionStats)
  }

  const submissions = await getSubmissions({
    status: status || undefined,
    language: language || undefined,
    userId: mySubmissions ? user.id : undefined
  })

  return NextResponse.json(submissions)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { type, language, title, description, sourceUrl, difficulty, topics } = body

  if (!type || !language || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const submission = await createSubmission({
    userId: user.id,
    type: type as ContentType,
    language: language as Language,
    title,
    description,
    sourceUrl,
    difficulty,
    topics
  })

  return NextResponse.json(submission)
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // TODO: Add moderator role check
  // For now, allow any authenticated user to moderate

  const body = await request.json()
  const { submissionId, status, notes } = body

  if (!submissionId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const submission = await reviewSubmission({
    submissionId,
    moderatorId: user.id,
    status,
    notes
  })

  return NextResponse.json(submission)
}
