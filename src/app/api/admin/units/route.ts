import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const units = await db.unit.findMany({
      orderBy: [{ level: "asc" }, { grade: "asc" }, { title: "asc" }],
      select: {
        id: true, title: true, grade: true, level: true,
        _count: { select: { questions: true } },
      },
    })
    return NextResponse.json({ units })
  } catch (err) {
    console.error("[GET /api/admin/units]", err)
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 })
  }
}

const createSchema = z.object({
  title: z.string().min(1),
  grade: z.string().min(1),
  level: z.enum(["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"]),
})

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    // Find or create the Mathematics subject
    let subject = await db.subject.findFirst({ where: { name: "Mathematics" } })
    if (!subject) {
      subject = await db.subject.create({ data: { name: "Mathematics" } })
    }

    const unit = await db.unit.create({
      data: { title: data.title, grade: data.grade, level: data.level, subjectId: subject.id },
      select: { id: true, title: true, grade: true, level: true },
    })

    return NextResponse.json({ unit }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error("[POST /api/admin/units]", err)
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 })
  }
}
