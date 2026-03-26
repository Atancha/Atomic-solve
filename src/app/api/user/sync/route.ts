// Called after Clerk sign-up to create the user record in our DB
import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()

  const user = await db.user.upsert({
    where: { clerkId: userId },
    create: { clerkId: userId, email, name },
    update: { email, name },
  })

  return NextResponse.json({ user })
}
