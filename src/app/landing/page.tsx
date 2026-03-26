import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

// Metadata for the landing page
export const metadata: Metadata = {
  title: 'Daily Revision — Improve your grades with small daily steps',
  description: 'We make daily revision effortless so students stay on track and see real grade improvements. 5 questions a day, instant feedback, and a streak system to keep you consistent.',
  keywords: ['daily revision', 'math practice', 'student revision', 'grade improvement', 'daily questions'],
  openGraph: {
    title: 'Daily Revision — Improve your grades with small daily steps',
    description: 'We make daily revision effortless so students stay on track and see real grade improvements.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Revision — Improve your grades with small daily steps',
    description: 'We make daily revision effortless so students stay on track and see real grade improvements.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
