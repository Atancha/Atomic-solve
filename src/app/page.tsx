import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { LandingPageContent } from "./landing/landing-page-content"

export { metadata } from "./landing/page"

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")
  return <LandingPageContent />
}
