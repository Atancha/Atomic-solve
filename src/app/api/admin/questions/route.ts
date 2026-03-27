import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
  unitId: z.string().min(1),
  text: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1),
})

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const unitId = searchParams.get("unitId")

    const questions = await db.question.findMany({
      where: unitId ? { unitId } : undefined,
      include: {
        unit: { select: { title: true, grade: true, level: true } },
      },
      orderBy: { unit: { title: "asc" } },
    })
    return NextResponse.json({ questions })
  } catch (err) {
    console.error("[GET /api/admin/questions]", err)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const question = await db.question.create({
      data: {
        unitId: data.unitId,
        text: data.text,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      },
    })
    return NextResponse.json({ question }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error("[POST /api/admin/questions]", err)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
