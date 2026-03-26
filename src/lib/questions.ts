import { db } from "@/lib/db"

const DAILY_LIMIT = 5

export async function getDailyQuestions(userId: string) {
  // Get the user's selected units
  const userUnits = await db.userUnit.findMany({
    where: { userId },
    select: { unitId: true },
  })
  const unitIds = userUnits.map((u) => u.unitId)
  if (unitIds.length === 0) return []

  // Questions already attempted today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayAttempts = await db.attempt.findMany({
    where: { userId, createdAt: { gte: todayStart } },
    select: { questionId: true },
  })
  const attemptedIds = new Set(todayAttempts.map((a) => a.questionId))

  // Get all questions for the user's units with accuracy per question
  const allProgress = await db.progress.findMany({
    where: { userId, unitId: { in: unitIds } },
    select: { unitId: true, correctAnswers: true, totalAnswered: true },
  })

  // Map accuracy by unitId (lower accuracy = higher weight)
  const accuracyMap = new Map<string, number>()
  for (const p of allProgress) {
    const accuracy = p.totalAnswered > 0 ? p.correctAnswers / p.totalAnswered : 0
    accuracyMap.set(p.unitId, accuracy)
  }

  // Get candidate questions not yet attempted today
  const candidates = await db.question.findMany({
    where: {
      unitId: { in: unitIds },
      id: { notIn: [...attemptedIds] },
    },
    include: { unit: { select: { title: true, grade: true } } },
  })

  if (candidates.length === 0) return []

  // Sort: prioritise weak units (low accuracy)
  candidates.sort((a, b) => {
    const accA = accuracyMap.get(a.unitId) ?? 0
    const accB = accuracyMap.get(b.unitId) ?? 0
    return accA - accB
  })

  // Shuffle within same-accuracy groups, then pick up to DAILY_LIMIT
  return candidates.slice(0, DAILY_LIMIT)
}
