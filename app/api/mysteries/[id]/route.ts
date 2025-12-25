import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteMystery } from "@/lib/db/mysteries"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await deleteMystery(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting mystery:", error)
    return NextResponse.json({ error: "Failed to delete mystery" }, { status: 500 })
  }
}
