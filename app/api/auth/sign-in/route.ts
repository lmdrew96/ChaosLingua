import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const validPassword = await verifyPassword(password, user.password_hash)

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const session = await createSession(user.id)
    await setSessionCookie(session.id)

    return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
