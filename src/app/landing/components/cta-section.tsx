"use client"

import Link from 'next/link'
import { ArrowRight, Flame, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/80">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="space-y-8">
              {/* Badge and stats */}
              <div className="flex flex-col items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Flame className="size-3 text-orange-500 fill-orange-500" />
                  Start your streak today
                </Badge>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-green-500" />
                    Free to use
                  </span>
                  <Separator orientation="vertical" className="!h-4" />
                  <span>5 questions daily</span>
                  <Separator orientation="vertical" className="!h-4" />
                  <span>All grade levels</span>
                </div>
              </div>

              {/* Main content */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Start improving your
                  <span className="flex sm:inline-flex justify-center">
                    <span className="relative mx-2">
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        grades
                      </span>
                      <div className="absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30" />
                    </span>
                    today
                  </span>
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl">
                  We make daily practice effortless so students stay on track and see real grade improvements.
                  Join students already building better habits — one day at a time.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <Button size="lg" className="cursor-pointer px-8 py-6 text-lg font-medium" asChild>
                  <Link href="/sign-up">
                    <Flame className="me-2 size-5 text-orange-300" />
                    Get Started Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="cursor-pointer px-8 py-6 text-lg font-medium group" asChild>
                  <Link href="/sign-in">
                    Sign In
                    <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-600 dark:bg-green-400 me-1" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 me-1" />
                  <TrendingUp className="size-3" />
                  <span>Instant progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-orange-500 me-1" />
                  <span>Daily streak system</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
