"use client"

import { BookOpen, Flame, Target, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DotPattern } from '@/components/dot-pattern'

const stats = [
  {
    icon: BookOpen,
    value: '5',
    label: 'Questions Daily',
    description: 'Focused, manageable practice every day'
  },
  {
    icon: Target,
    value: '7',
    label: 'Grade Levels',
    description: 'Primary, High School & International'
  },
  {
    icon: Flame,
    value: '∞',
    label: 'Day Streaks',
    description: 'Keep your momentum going'
  },
  {
    icon: Zap,
    value: '100%',
    label: 'Instant Feedback',
    description: 'Know exactly why you got it right or wrong'
  }
]

export function StatsSection() {
  return (
    <section className="py-12 sm:py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20" />
      <DotPattern className="opacity-75" size="md" fadeStyle="circle" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center bg-background/60 backdrop-blur-sm border-border/50 py-0"
            >
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</h3>
                  <p className="font-semibold text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
