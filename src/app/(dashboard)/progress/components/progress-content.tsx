"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, CheckCircle2 } from "lucide-react"

type ProgressItem = {
  id: string
  totalAnswered: number
  correctAnswers: number
  completionPercentage: number
  unit: { title: string; grade: string; level: string }
}

export function ProgressContent() {
  const [progress, setProgress] = useState<ProgressItem[]>([])
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/progress").then((r) => r.ok ? r.json() : { progress: [] }),
      fetch("/api/streak").then((r) => r.ok ? r.json() : { currentStreak: 0, longestStreak: 0 }),
    ]).then(([prog, str]) => {
      setProgress(prog.progress ?? [])
      setStreak(str)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  const totalAnswered = progress.reduce((s, p) => s + p.totalAnswered, 0)
  const totalCorrect = progress.reduce((s, p) => s + p.correctAnswers, 0)
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{streak.currentStreak}</p>
            <p className="text-muted-foreground text-sm mt-1">Current Streak 🔥</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{overallAccuracy}%</p>
            <p className="text-muted-foreground text-sm mt-1">Overall Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{totalAnswered}</p>
            <p className="text-muted-foreground text-sm mt-1">Questions Answered</p>
          </CardContent>
        </Card>
      </div>

      {/* Unit progress list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Unit Breakdown</h2>
        {progress.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No attempts yet. Start answering questions to see your progress here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {progress.map((p) => {
              const accuracy = p.totalAnswered > 0
                ? Math.round((p.correctAnswers / p.totalAnswered) * 100)
                : 0
              return (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{p.unit.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{p.unit.grade}</Badge>
                        {p.completionPercentage >= 100 && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {accuracy}% accuracy ({p.correctAnswers}/{p.totalAnswered})
                      </span>
                      <span>{Math.round(p.completionPercentage)}% complete</span>
                    </div>
                    <Progress value={p.completionPercentage} className="h-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
