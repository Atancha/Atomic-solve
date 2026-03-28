import { db } from "@/lib/db"

const DAILY_LIMIT = 5

export async function getDailyQuestions(userId: string) {
  // Get user's grade
  const user = await db.user.findUnique({ where: { id: userId }, select: { grade: true } })
  if (!user?.grade) return []

  // Questions already attempted today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayAttempts = await db.attempt.findMany({
    where: { userId, createdAt: { gte: todayStart } },
    select: { questionId: true },
  })
  const attemptedTodayIds = new Set(todayAttempts.map((a) => a.questionId))

  // All questions the user has ever attempted (any day)
  const allAttempts = await db.attempt.findMany({
    where: { userId },
    select: { questionId: true },
    distinct: ["questionId"],
  })
  const everAttemptedIds = new Set(allAttempts.map((a) => a.questionId))

  // Unit-level accuracy for weakness weighting
  const progressRecords = await db.progress.findMany({
    where: { userId },
    select: { unitId: true, correctAnswers: true, totalAnswered: true },
  })
  const accuracyMap = new Map<string, number>()
  for (const p of progressRecords) {
    const accuracy = p.totalAnswered > 0 ? p.correctAnswers / p.totalAnswered : 0
    accuracyMap.set(p.unitId, accuracy)
  }

  // All questions for the user's grade, excluding already attempted today
  const allGradeQuestions = await db.question.findMany({
    where: {
      unit: { grade: user.grade },
      id: { notIn: [...attemptedTodayIds] },
    },
    include: { unit: { select: { title: true, grade: true } } },
  })

  if (allGradeQuestions.length === 0) return []

  // Split into unseen (never attempted) and seen (attempted on a previous day)
  const unseen = allGradeQuestions.filter((q) => !everAttemptedIds.has(q.id))
  const seen = allGradeQuestions.filter((q) => everAttemptedIds.has(q.id))

  // Sort each pool: lower unit accuracy first (weakness-weighted), shuffle ties
  function sortByWeakness<T extends { unitId: string }>(arr: T[]): T[] {
    return [...arr].sort((a, b) => {
      const accA = accuracyMap.get(a.unitId) ?? 0
      const accB = accuracyMap.get(b.unitId) ?? 0
      if (accA !== accB) return accA - accB
      return Math.random() - 0.5 // shuffle within same-accuracy bucket
    })
  }

  const sortedUnseen = sortByWeakness(unseen)
  const sortedSeen = sortByWeakness(seen)

  // Fill up to DAILY_LIMIT: unseen first, then seen
  const picked = [...sortedUnseen, ...sortedSeen].slice(0, DAILY_LIMIT)

  return picked
}
