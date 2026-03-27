import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neon } from "@neondatabase/serverless"

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.")
  }
  const sql = neon(connectionString)
  const adapter = new PrismaNeon(sql)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!global._prisma) {
      global._prisma = createClient()
    }
    const client = global._prisma
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})
