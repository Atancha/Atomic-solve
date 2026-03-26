import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(1),
  grade: z.string().min(1),
  level: z.enum(["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"]),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

    const unit = await db.unit.update({
      where: { id },
      data: { title: data.title, grade: data.grade, level: data.level },
      select: { id: true, title: true, grade: true, level: true },
    })
    return NextResponse.json({ unit })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error("[PUT /api/admin/units/:id]", err)
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const questionCount = await db.question.count({ where: { unitId: id } })
    if (questionCount > 0) {
      return NextResponse.json(
        { error: `This unit has ${questionCount} question${questionCount !== 1 ? "s" : ""}. Delete all its questions first.` },
        { status: 409 }
      )
    }
    await db.unit.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/admin/units/:id]", err)
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 })
  }
}
