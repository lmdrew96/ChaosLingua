import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getOrCreateUserProfile, updateUserProfile } from "@/lib/db/users"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getOrCreateUserProfile(user.id)
    profile.name = user.display_name || "Explorer"

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    await updateUserProfile(user.id, updates)

    const profile = await getOrCreateUserProfile(user.id)
    profile.name = user.display_name || "Explorer"

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
