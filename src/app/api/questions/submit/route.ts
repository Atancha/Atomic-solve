import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { updateStreak } from "@/lib/streak"
import { z } from "zod"

const schema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
})

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { questionId, selectedAnswer } = parsed.data

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const question = await db.question.findUnique({ where: { id: questionId } })
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 })

  const isCorrect = selectedAnswer === question.correctAnswer

  // Save attempt
  await db.attempt.create({
    data: { userId: user.id, questionId, selectedAnswer, isCorrect },
  })

  // Update progress for this unit
  const allUnitAttempts = await db.attempt.findMany({
    where: { userId: user.id, question: { unitId: question.unitId } },
    distinct: ["questionId"],
    orderBy: { createdAt: "desc" },
  })

  const totalQuestionsInUnit = await db.question.count({ where: { unitId: question.unitId } })
  const distinctAnswered = allUnitAttempts.length
  const correctCount = allUnitAttempts.filter((a) => a.isCorrect).length
  const completionPct = totalQuestionsInUnit > 0 ? (distinctAnswered / totalQuestionsInUnit) * 100 : 0

  await db.progress.upsert({
    where: { userId_unitId: { userId: user.id, unitId: question.unitId } },
    create: {
      userId: user.id,
      unitId: question.unitId,
      totalAnswered: distinctAnswered,
      correctAnswers: correctCount,
      completionPercentage: completionPct,
    },
    update: {
      totalAnswered: distinctAnswered,
      correctAnswers: correctCount,
      completionPercentage: completionPct,
    },
  })

  // Update streak on every answer (streak.ts de-dupes same-day calls)
  try {
    await updateStreak(user.id)
  } catch (e) {
    console.error("updateStreak failed:", e)
  }

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  })
}
