import { SignIn } from "@clerk/nextjs"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Link href="/sign-in" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          Daily Revision
        </Link>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-border rounded-xl w-full",
            },
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
