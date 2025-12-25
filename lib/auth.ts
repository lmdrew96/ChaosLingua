import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  expires_at: string
}

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, displayName?: string): Promise<User | null> {
  const passwordHash = await hashPassword(password)

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return null
    }

    const result = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email}, ${passwordHash}, ${displayName || null})
      RETURNING id, email, display_name, created_at
    `

    if (result.length === 0) return null

    const user = result[0] as User

    // Create default profile, stats, and settings
    await sql`INSERT INTO user_profiles (id) VALUES (${user.id})`
    await sql`INSERT INTO user_stats (id) VALUES (${user.id})`
    await sql`INSERT INTO user_settings (id) VALUES (${user.id})`

    return user
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string }
    if (e.code === "23505" || e.message?.includes("duplicate key") || e.message?.includes("unique constraint")) {
      return null
    }
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const result = await sql`
    SELECT id, email, password_hash, display_name, created_at
    FROM users WHERE email = ${email}
  `
  return (result[0] as User & { password_hash: string }) || null
}

export async function createSession(userId: string): Promise<Session> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const result = await sql`
    INSERT INTO auth_sessions (user_id, expires_at)
    VALUES (${userId}, ${expiresAt.toISOString()})
    RETURNING id, user_id, expires_at
  `

  return result[0] as Session
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await sql`
    SELECT id, user_id, expires_at FROM auth_sessions
    WHERE id = ${sessionId} AND expires_at > NOW()
  `
  return (result[0] as Session) || null
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql`DELETE FROM auth_sessions WHERE id = ${sessionId}`
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) return null

  const session = await getSession(sessionId)
  if (!session) return null

  const result = await sql`
    SELECT id, email, display_name, created_at
    FROM users WHERE id = ${session.user_id}
  `

  return (result[0] as User) || null
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session_id")
}
