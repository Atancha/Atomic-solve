import { db } from "@/lib/db"

/** Returns midnight UTC for a given date (defaults to now) */
function utcMidnight(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export async function updateStreak(userId: string) {
  const today = utcMidnight()
  const yesterday = utcMidnight(new Date(today.getTime() - 86_400_000)) // exactly 24 h back

  const streak = await db.streak.findUnique({ where: { userId } })

  if (!streak) {
    await db.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    })
    return
  }

  // Normalise the stored date to UTC midnight for safe comparison
  const last = streak.lastActiveDate ? utcMidnight(new Date(streak.lastActiveDate)) : null

  if (last && last.getTime() === today.getTime()) {
    // Already recorded today — nothing to do
    return
  }

  const isConsecutive = last !== null && last.getTime() === yesterday.getTime()
  const newCurrent = isConsecutive ? streak.currentStreak + 1 : 1
  const newLongest = Math.max(streak.longestStreak, newCurrent)

  await db.streak.update({
    where: { userId },
    data: { currentStreak: newCurrent, longestStreak: newLongest, lastActiveDate: today },
  })
}
