import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Level } from "@prisma/client"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const level = searchParams.get("level") as Level | null
  const grade = searchParams.get("grade")

  const units = await db.unit.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(grade ? { grade } : {}),
    },
    include: { subject: { select: { name: true } } },
    orderBy: [{ grade: "asc" }, { title: "asc" }],
  })

  return NextResponse.json({ units })
}
