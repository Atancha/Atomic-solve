"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Testimonial = {
  name: string
  role: string
  initials: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Amara N.',
    role: 'Grade 6 · Primary',
    initials: 'AN',
    quote: 'I used to struggle with fractions but after two weeks of daily questions I finally get it. My teacher even noticed I was putting my hand up more in class.',
  },
  {
    name: 'Kwame B.',
    role: 'Form 3 · High School',
    initials: 'KB',
    quote: 'The streak feature keeps me going even when I don\'t feel like revising. I\'m on 21 days now and I don\'t want to break it.',
  },
  {
    name: 'Priya M.',
    role: 'Grade 9 · International',
    initials: 'PM',
    quote: 'I like that it shows me exactly which units I\'m weak in. Now I know where to focus instead of just doing random practice.',
  },
  {
    name: 'Ethan O.',
    role: 'Form 4 · High School',
    initials: 'EO',
    quote: 'Five questions is the perfect amount. It\'s short enough that I actually do it every day instead of putting it off.',
  },
  {
    name: 'Fatima A.',
    role: 'Grade 10 · Primary',
    initials: 'FA',
    quote: 'The explanations are really clear. When I get something wrong it doesn\'t just say "incorrect" — it shows me the proper working so I understand where I went wrong.',
  },
  {
    name: 'Liam K.',
    role: 'Grade 8 · International',
    initials: 'LK',
    quote: 'My accuracy on algebra went from 50% to 79% in a month. The progress chart makes it really satisfying to see improvement.',
  },
  {
    name: 'Zara H.',
    role: 'Form 3 · High School',
    initials: 'ZH',
    quote: 'I like that it gives me harder questions in topics I\'m weak at. It pushed me in the right places without being overwhelming.',
  },
  {
    name: 'Chidi E.',
    role: 'Grade 7 · Primary',
    initials: 'CE',
    quote: 'My mum sets a reminder for 7pm every day and we do it together sometimes. It only takes 5 minutes and I\'m getting better at maths.',
  },
  {
    name: 'Sofia R.',
    role: 'Grade 6 · International',
    initials: 'SR',
    quote: 'I scored 91% on my last maths test after using this for six weeks. My best score ever. Honestly didn\'t expect it to help this much.',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-8 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Student Stories</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Real students, real improvement
          </h2>
          <p className="text-lg text-muted-foreground">
            Students across grade levels are building better habits and seeing their grades climb — one day at a time.
          </p>
        </div>

        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="mb-6 break-inside-avoid shadow-none lg:mb-4">
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="bg-primary/10 size-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <span className="text-muted-foreground block text-sm tracking-wide">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance">&ldquo;{testimonial.quote}&rdquo;</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
