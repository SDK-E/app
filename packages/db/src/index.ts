import { getServerEnv } from "@platform/env";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export function isClosedConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /Server has closed the connection|Connection terminated unexpectedly/.test(error.message)
  );
}

export async function retryOnClosedConnection<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isClosedConnectionError(error)) {
      throw error;
    }
    return await operation();
  }
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getServerEnv().DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({ adapter });
}
