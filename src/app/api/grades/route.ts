import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const rows = await db.unit.findMany({
    select: { grade: true, level: true },
    distinct: ["grade", "level"],
    orderBy: { grade: "asc" },
  })

  const gradesByLevel: Record<string, string[]> = {}
  for (const { grade, level } of rows) {
    if (!gradesByLevel[level]) gradesByLevel[level] = []
    if (!gradesByLevel[level].includes(grade)) gradesByLevel[level].push(grade)
  }

  return NextResponse.json(gradesByLevel)
}
