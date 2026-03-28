import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { Level } from "@prisma/client"

const schema = z.object({
  level: z.nativeEnum(Level),
  grade: z.string().min(1),
})

export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { level, grade } = parsed.data

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const gradeChanged = user.grade !== grade || user.level !== level

  // Update level and grade
  await db.user.update({
    where: { clerkId },
    data: { level, grade },
  })

  // Clear progress records if grade changed — old grade progress is irrelevant
  if (gradeChanged) {
    await db.progress.deleteMany({ where: { userId: user.id } })
  }

  return NextResponse.json({ success: true, gradeChanged })
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { level: true, grade: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({ level: user.level, grade: user.grade })
}
