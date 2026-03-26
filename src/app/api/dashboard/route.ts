import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Today's attempts
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayAttempts = await db.attempt.findMany({
    where: { userId: user.id, createdAt: { gte: todayStart } },
    select: { isCorrect: true },
  })

  const todayCount = todayAttempts.length
  const todayCorrect = todayAttempts.filter((a) => a.isCorrect).length
  const dailyGoal = 5
  const goalMet = todayCount >= dailyGoal

  // Streak
  const streak = await db.streak.findUnique({ where: { userId: user.id } })

  // Progress — suggested unit (lowest completion)
  const progress = await db.progress.findMany({
    where: { userId: user.id },
    include: { unit: { select: { title: true, grade: true, id: true } } },
    orderBy: { completionPercentage: "asc" },
  })

  const suggestedUnit = progress[0]?.unit ?? null

  // All-time accuracy
  const allAttempts = await db.attempt.count({ where: { userId: user.id } })
  const allCorrect = await db.attempt.count({ where: { userId: user.id, isCorrect: true } })
  const overallAccuracy = allAttempts > 0 ? Math.round((allCorrect / allAttempts) * 100) : 0

  return NextResponse.json({
    todayCount,
    todayCorrect,
    dailyGoal,
    goalMet,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    suggestedUnit,
    overallAccuracy,
    totalAttempts: allAttempts,
  })
}
