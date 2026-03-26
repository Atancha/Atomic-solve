import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ currentStreak: 0, longestStreak: 0, lastActiveDate: null })

    const streak = await db.streak.findUnique({ where: { userId: user.id } })

    return NextResponse.json({
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate ?? null,
    })
  } catch (err) {
    console.error("[/api/streak]", err)
    return NextResponse.json({ currentStreak: 0, longestStreak: 0, lastActiveDate: null })
  }
}
