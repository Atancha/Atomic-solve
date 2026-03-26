import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { z } from "zod"

const itemSchema = z.object({
  unit: z.string().min(1),
  grade: z.string().min(1),
  text: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected a JSON array of questions" }, { status: 400 })
  }

  // Load all units once
  const allUnits = await db.unit.findMany({ select: { id: true, title: true, grade: true } })

  const imported: string[] = []
  const failed: { index: number; reason: string }[] = []

  for (let i = 0; i < body.length; i++) {
    const parsed = itemSchema.safeParse(body[i])
    if (!parsed.success) {
      failed.push({ index: i, reason: parsed.error.errors.map((e) => e.message).join(", ") })
      continue
    }

    const { unit: unitTitle, grade, text, options, correctAnswer, explanation } = parsed.data

    const match = allUnits.find(
      (u) =>
        u.title.toLowerCase() === unitTitle.toLowerCase() &&
        u.grade.toLowerCase() === grade.toLowerCase()
    )

    if (!match) {
      failed.push({ index: i, reason: `Unit "${unitTitle}" with grade "${grade}" not found` })
      continue
    }

    try {
      await db.question.create({
        data: { unitId: match.id, text, options, correctAnswer, explanation },
      })
      imported.push(text.slice(0, 60))
    } catch (err) {
      failed.push({ index: i, reason: String(err) })
    }
  }

  return NextResponse.json({ imported: imported.length, failed })
}
