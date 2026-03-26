import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDailyQuestions } from "@/lib/questions"

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!user.onboarded) return NextResponse.json({ error: "Not onboarded" }, { status: 403 })

  const questions = await getDailyQuestions(user.id)

  // Don't expose correct answers to client
  const safe = questions.map(({ correctAnswer: _ca, explanation: _ex, ...q }) => q)

  return NextResponse.json({ questions: safe, total: questions.length })
}
