import { NextResponse } from "next/server"
import { createUser, createSession, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const user = await createUser(email, password, displayName)

    if (!user) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const session = await createSession(user.id)
    await setSessionCookie(session.id)

    return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } })
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
