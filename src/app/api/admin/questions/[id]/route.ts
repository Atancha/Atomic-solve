import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  unitId: z.string().min(1),
  text: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

    const question = await db.question.update({
      where: { id },
      data: {
        unitId: data.unitId,
        text: data.text,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      },
    })
    return NextResponse.json({ question })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error("[PUT /api/admin/questions/:id]", err)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    await db.question.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/admin/questions/:id]", err)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
