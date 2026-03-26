import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Check your .env file.")
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

// Proxy ensures createClient() is deferred until the first property access,
// so process.env.DATABASE_URL is guaranteed to be loaded by Next.js beforehand.
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
