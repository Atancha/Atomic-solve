import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { Level } from "@prisma/client"

const schema = z.object({
  level: z.nativeEnum(Level),
  grade: z.string().min(1),
  unitIds: z.array(z.string()).min(1, "Select at least one unit"),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { level, grade, unitIds } = parsed.data

  // Update user profile
  const user = await db.user.update({
    where: { clerkId: userId },
    data: { level, grade, onboarded: true },
  })

  // Set selected units (replace any previous)
  await db.userUnit.deleteMany({ where: { userId: user.id } })
  await db.userUnit.createMany({
    data: unitIds.map((unitId) => ({ userId: user.id, unitId })),
    skipDuplicates: true,
  })

  // Initialise streak record
  await db.streak.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  return NextResponse.json({ success: true })
}
