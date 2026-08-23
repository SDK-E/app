import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPrisma } from "@sdk-e/db";

const mocks = vi.hoisted(() => {
  const getServerEnv = vi.fn();
  return { getServerEnv };
});

vi.mock("@sdk-e/env", () => ({ getServerEnv: mocks.getServerEnv }));
vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    connectionString: string;
    max?: number;
    connectionTimeoutMillis?: number;
    constructor(options: {
      connectionString: string;
      max?: number;
      connectionTimeoutMillis?: number;
    }) {
      this.connectionString = options.connectionString;
      this.max = options.max;
      this.connectionTimeoutMillis = options.connectionTimeoutMillis;
    }
  },
}));

const prismaClientStub = vi.hoisted(() => vi.fn());
vi.mock("./generated/prisma/client", () => ({
  PrismaClient: prismaClientStub,
}));

beforeEach(() => {
  mocks.getServerEnv.mockReset();
  prismaClientStub.mockReset();
  delete (globalThis as { prisma?: unknown }).prisma;
});

describe("getPrisma", () => {
  it("constructs the client with a Postgres adapter using the database URL", () => {
    mocks.getServerEnv.mockReturnValue({ DATABASE_URL: "postgresql://user@db.example.test/app" });

    const client = getPrisma();

    expect(mocks.getServerEnv).toHaveBeenCalled();
    const [args] = prismaClientStub.mock.calls;
    expect(args).toEqual([
      {
        adapter: expect.objectContaining({
          connectionString: "postgresql://user@db.example.test/app",
          max: 2,
          connectionTimeoutMillis: 5_000,
        }),
      },
    ]);
    expect(client).toBe(prismaClientStub.mock.results[0].value);
  });

  it("bounds the pool so the client stays under the database connection limit", () => {
    mocks.getServerEnv.mockReturnValue({ DATABASE_URL: "postgresql://user@db.example.test/app" });

    getPrisma();

    const [args] = prismaClientStub.mock.calls;
    const adapter = args[0].adapter as { max?: number };
    expect(adapter.max).toBeLessThanOrEqual(2);
  });

  it("caches the client instance across calls", () => {
    mocks.getServerEnv.mockReturnValue({ DATABASE_URL: "postgresql://user@db.example.test/app" });
    prismaClientStub.mockImplementation(function () {
      return {};
    });

    expect(getPrisma()).toBe(getPrisma());
    expect(prismaClientStub).toHaveBeenCalledTimes(1);
  });
});
