import "server-only"
import { auth } from "@clerk/nextjs/server"

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) {
    return false
  }
  return true
}
