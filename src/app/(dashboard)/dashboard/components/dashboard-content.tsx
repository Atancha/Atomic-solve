"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, Target, TrendingUp, BookOpen, ArrowRight, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardData = {
  todayCount: number
  todayCorrect: number
  dailyGoal: number
  goalMet: boolean
  currentStreak: number
  longestStreak: number
  suggestedUnit: { id: string; title: string; grade: string } | null
  overallAccuracy: number
  totalAttempts: number
}

export function DashboardContent({ userName }: { userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
  }, [])

  if (!data) return <DashboardSkeleton />

  const goalPct = Math.min((data.todayCount / data.dailyGoal) * 100, 100)

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {data.goalMet ? "🎉 Goal complete!" : `Good day, ${userName}`}
        </h1>
        <p className="text-muted-foreground text-sm">
          {data.goalMet
            ? "You've finished today's questions. Come back tomorrow to keep your streak!"
            : `You've answered ${data.todayCount} of ${data.dailyGoal} questions today.`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Current Streak"
          value={`${data.currentStreak} day${data.currentStreak !== 1 ? "s" : ""}`}
          sub={`Best: ${data.longestStreak} days`}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-blue-500" />}
          label="Today's Progress"
          value={`${data.todayCount} / ${data.dailyGoal}`}
          sub={data.goalMet ? "Daily goal met ✓" : `${data.dailyGoal - data.todayCount} left`}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Overall Accuracy"
          value={`${data.overallAccuracy}%`}
          sub={`${data.totalAttempts} questions answered`}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          label="Today Correct"
          value={`${data.todayCorrect}`}
          sub={data.todayCount > 0 ? `${Math.round((data.todayCorrect / data.todayCount) * 100)}% accuracy today` : "No attempts yet"}
        />
      </div>

      {/* Daily goal bar + CTA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Goal</CardTitle>
          <CardDescription>
            {data.todayCount} of {data.dailyGoal} questions completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={goalPct} className="h-3" />
          {!data.goalMet && (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/questions">
                <BookOpen className="mr-2 h-4 w-4" />
                {data.todayCount === 0 ? "Start Today's Questions" : "Continue Questions"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Suggested unit */}
      {data.suggestedUnit && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Suggested Next</CardTitle>
              <Badge variant="outline">{data.suggestedUnit.grade}</Badge>
            </div>
            <CardDescription>A unit that needs more practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-medium">{data.suggestedUnit.title}</p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/questions">
                  Practice <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" asChild className="h-12 justify-start gap-3">
          <Link href="/questions">
            <BookOpen className="h-4 w-4" />
            Answer Questions
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-12 justify-start gap-3">
          <Link href="/progress">
            <TrendingUp className="h-4 w-4" />
            View Progress
          </Link>
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{sub}</p>
          </div>
          <div className="rounded-full bg-muted p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-36 rounded-xl" />
    </div>
  )
}
