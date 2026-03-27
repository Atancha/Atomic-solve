"use client"

import Link from 'next/link'
import { Flame, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Testimonials', href: '#testimonials' },
  ],
  account: [
    { name: 'Sign In', href: '/sign-in' },
    { name: 'Get Started', href: '/sign-up' },
    { name: 'Dashboard', href: '/dashboard' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-1">
            <Link href="/landing" className="flex items-center gap-2 mb-4">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">Atomic Solve</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Improve your grades with small daily steps. Five questions a day, instant feedback, and progress you can see.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
            <span>for students everywhere</span>
          </div>
          <span>© {new Date().getFullYear()} Atomic Solve. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
