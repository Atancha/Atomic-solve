"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, ChevronRight, Loader2, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MathText } from "@/components/math-text"

type Question = {
  id: string
  text: string
  options: string[]
  unit: { title: string; grade: string }
}

type Feedback = {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
}

const OPTION_LABELS = ["A", "B", "C", "D"]

export function QuestionsSession() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [results, setResults] = useState<{ isCorrect: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch("/api/questions/daily")
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? [])
        setLoading(false)
      })
  }, [])

  const handleSelect = (label: string) => {
    if (feedback) return // already answered
    setSelected(label)
  }

  const handleSubmit = useCallback(async () => {
    if (!selected || submitting || !questions[current]) return
    setSubmitting(true)

    const res = await fetch("/api/questions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: questions[current].id, selectedAnswer: selected }),
    })
    const data: Feedback = await res.json()
    setFeedback(data)
    setResults((prev) => [...prev, { isCorrect: data.isCorrect }])
    setSubmitting(false)
  }, [selected, submitting, questions, current])

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setFeedback(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-lg">
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">All done for today!</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            You&apos;ve completed all available questions for today. Come back tomorrow!
          </p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  if (done) {
    const correct = results.filter((r) => r.isCorrect).length
    const pct = Math.round((correct / results.length) * 100)
    return (
      <Card className="max-w-lg">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
          <CardTitle>Session Complete!</CardTitle>
          <CardDescription>Here&apos;s how you did today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-4xl font-bold">{correct}/{results.length}</p>
            <p className="text-muted-foreground text-sm">correct answers</p>
          </div>
          <Progress value={pct} className="h-3" />
          <p className="text-center text-sm font-medium">{pct}% accuracy this session</p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={() => router.push("/dashboard")} className="flex-1">Dashboard</Button>
          <Button variant="outline" onClick={() => router.push("/progress")} className="flex-1">View Progress</Button>
        </CardFooter>
      </Card>
    )
  }

  const q = questions[current]
  const options = q.options as string[]
  const progressPct = ((current) / questions.length) * 100

  return (
    <div className="max-w-lg space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{results.filter((r) => r.isCorrect).length} correct so far</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{q.unit.grade}</Badge>
            <Badge variant="outline">{q.unit.title}</Badge>
          </div>
          <CardTitle className="text-base leading-snug"><MathText text={q.text} /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {options.map((opt, i) => {
            const label = OPTION_LABELS[i]
            const isSelected = selected === label
            const isCorrect = feedback?.correctAnswer === label
            const isWrong = feedback && isSelected && !feedback.isCorrect

            return (
              <button
                key={label}
                onClick={() => handleSelect(label)}
                disabled={!!feedback}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                  "flex items-center gap-3",
                  !feedback && !isSelected && "hover:bg-muted",
                  !feedback && isSelected && "border-primary bg-primary/10",
                  feedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  feedback && isWrong && "border-red-400 bg-red-50 dark:bg-red-950",
                  feedback && !isCorrect && !isSelected && "opacity-50",
                )}
              >
                <span className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  !feedback && isSelected && "border-primary bg-primary text-primary-foreground",
                  feedback && isCorrect && "border-green-500 bg-green-500 text-white",
                  feedback && isWrong && "border-red-400 bg-red-400 text-white",
                )}>
                  {label}
                </span>
                <span className="flex-1"><MathText text={opt} /></span>
                {feedback && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                {feedback && isWrong && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
              </button>
            )
          })}
        </CardContent>

        {/* Feedback explanation */}
        {feedback && (
          <div className={cn(
            "mx-4 mb-4 rounded-lg p-3 text-sm",
            feedback.isCorrect ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          )}>
            <p className="font-semibold mb-1">{feedback.isCorrect ? "Correct! ✓" : "Incorrect ✗"}</p>
            <p><MathText text={feedback.explanation} /></p>
          </div>
        )}

        <CardFooter>
          {!feedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full">
              {current + 1 >= questions.length ? "See Results" : "Next Question"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
