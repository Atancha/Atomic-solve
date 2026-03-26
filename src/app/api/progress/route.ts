import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ progress: [] })

    const progress = await db.progress.findMany({
      where: { userId: user.id },
      include: { unit: { select: { title: true, grade: true, level: true } } },
      orderBy: { completionPercentage: "desc" },
    })

    return NextResponse.json({ progress })
  } catch (err) {
    console.error("[/api/progress]", err)
    return NextResponse.json({ progress: [] })
  }
}
