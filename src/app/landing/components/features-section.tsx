"use client"

import Link from 'next/link'
import {
  BookOpen,
  Flame,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Brain,
  Target,
  BarChart3,
  Repeat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const coreFeatures = [
  {
    icon: BookOpen,
    title: 'Daily 5 Questions',
    description: 'Get 5 personalised math questions every day — short enough to stay consistent, meaningful enough to improve.'
  },
  {
    icon: Brain,
    title: 'Weighted by Weakness',
    description: 'Questions are chosen based on where you struggle most, so every session targets the areas that need it.'
  },
  {
    icon: CheckCircle2,
    title: 'Instant Explanation',
    description: 'After each answer you see whether you were right and a clear explanation of why — no guessing in the dark.'
  },
  {
    icon: Target,
    title: 'Curriculum-Aligned',
    description: 'Questions cover the exact topics on your grade\'s syllabus — Primary, High School, and International tracks.'
  }
]

const progressFeatures = [
  {
    icon: Flame,
    title: 'Streak System',
    description: 'Answer questions daily to build a streak. A visible streak makes it easy to stay motivated and consistent.'
  },
  {
    icon: TrendingUp,
    title: 'Unit Progress',
    description: 'See your accuracy and completion percentage for every unit so you always know where you stand.'
  },
  {
    icon: BarChart3,
    title: 'Overall Accuracy',
    description: 'Track your overall correct answer rate over time and watch it climb as your revision pays off.'
  },
  {
    icon: Repeat,
    title: 'Spaced Repetition',
    description: 'Units you\'ve mastered appear less often, giving more time to the ones you\'re still working on.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything a student needs to improve, nothing they don&apos;t
          </h2>
          <p className="text-lg text-muted-foreground">
            Daily Revision is built around one idea: small, consistent practice beats last-minute cramming every time.
          </p>
        </div>

        {/* First Feature Block */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left — Visual */}
          <div className="relative rounded-2xl border bg-card p-8 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">Grade 6 · Fractions</Badge>
                <span className="text-xs text-muted-foreground">Question 3 of 5</span>
              </div>
              <p className="font-semibold text-base">What is ¾ + ½?</p>
              {[
                { label: 'A', text: '1/4', correct: false },
                { label: 'B', text: '5/4', correct: true },
                { label: 'C', text: '3/8', correct: false },
                { label: 'D', text: '1', correct: false },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                    opt.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'opacity-60'
                  }`}
                >
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    opt.correct ? 'border-green-500 bg-green-500 text-white' : ''
                  }`}>
                    {opt.label}
                  </span>
                  <span>{opt.text}</span>
                  {opt.correct && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
              ))}
              <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-800 dark:text-green-200">
                <p className="font-semibold mb-1">Correct! ✓</p>
                <p>Convert to a common denominator: ¾ + 2⁄4 = 5⁄4</p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Practice that actually teaches
              </h3>
              <p className="text-muted-foreground text-base">
                Every question is followed by a clear explanation — not just the answer. Students understand
                the why, which means they can solve similar problems on their own in exams.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {coreFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button size="lg" className="cursor-pointer" asChild>
              <Link href="/sign-up">
                Start for Free
                <ArrowRight className="ms-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Second Feature Block — flipped */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Progress you can see, streaks you want to keep
              </h3>
              <p className="text-muted-foreground text-base">
                The progress dashboard shows exactly how each unit is going. The streak counter
                makes daily revision feel like a habit worth protecting — not a chore.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {progressFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <Link href="/sign-up">See Your Progress</Link>
            </Button>
          </div>

          {/* Right — Visual */}
          <div className="relative rounded-2xl border bg-card p-8 shadow-lg order-1 lg:order-2">
            <div className="space-y-4">
              <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">My Progress</p>

              {/* Streak cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" /> Current Streak
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-3xl font-bold">84%</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall Accuracy</p>
                </div>
              </div>

              {/* Unit bars */}
              {[
                { unit: 'Fractions', pct: 80, accuracy: '88%' },
                { unit: 'Algebra', pct: 55, accuracy: '72%' },
                { unit: 'Geometry', pct: 35, accuracy: '60%' },
              ].map((u) => (
                <div key={u.unit} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{u.unit}</span>
                    <span className="text-muted-foreground">{u.accuracy} accuracy</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${u.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
