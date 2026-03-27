"use client"

import Link from 'next/link'
import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'What grade levels are supported?',
    answer:
      'Atomic Solve covers three tracks: Primary (Grade 6, 7, and 10), High School (Form 3 and Form 4), and International (Grade 5, 6, 8, and 9). When you sign up you choose your level and grade, and all your questions are matched to your syllabus.',
  },
  {
    value: 'item-2',
    question: 'How many questions do I get each day?',
    answer:
      'You get exactly 5 questions per session. This amount is intentional — it is short enough to do consistently every day but covers enough ground to build real knowledge over time. Quality over quantity.',
  },
  {
    value: 'item-3',
    question: 'How are the questions chosen for me?',
    answer:
      'Questions are selected from the units you chose during setup. The algorithm weighs units where your accuracy is lower more heavily, so you spend more time practicing where you actually need it — not on topics you already know well.',
  },
  {
    value: 'item-4',
    question: 'What subjects does Atomic Solve cover?',
    answer:
      'Currently Atomic Solve focuses on Mathematics. Topics include fractions, algebra, geometry, number theory, statistics, trigonometry, calculus (for higher levels), and more — all matched to your specific grade.',
  },
  {
    value: 'item-5',
    question: 'How does the streak system work?',
    answer:
      'Your streak counts the number of consecutive days you have answered at least one question. Answer today and your streak grows by 1. Miss a day and it resets to 0. Your longest ever streak is also saved so you always have a personal best to beat.',
  },
  {
    value: 'item-6',
    question: 'Is Atomic Solve free?',
    answer:
      'Yes — Atomic Solve is free to use. Sign up, complete your profile, and start answering questions straight away. No credit card required.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know before you start. Still unsure? Just sign up — it&apos;s free.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent">
            <div className="p-0">
              <Accordion type="single" collapsible className="space-y-5">
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className="rounded-md !border bg-transparent">
                    <AccordionTrigger className="cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                          <CircleHelp className="size-5" />
                        </div>
                        <span className="text-start font-semibold">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-transparent">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ready to start improving your grades?</p>
            <Button className="cursor-pointer" asChild>
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
