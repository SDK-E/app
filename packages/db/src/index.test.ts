import { getPrisma, isClosedConnectionError, retryOnClosedConnection } from "@platform/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getServerEnv = vi.fn();
  return { getServerEnv };
});

vi.mock("@platform/env", () => ({ getServerEnv: mocks.getServerEnv }));
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

describe("isClosedConnectionError", () => {
  it("returns true when the message indicates a closed connection", () => {
    expect(isClosedConnectionError(new Error("Server has closed the connection"))).toBe(true);
  });

  it("returns true when the message indicates a terminated connection", () => {
    expect(isClosedConnectionError(new Error("Connection terminated unexpectedly"))).toBe(true);
  });

  it("returns false for an Error with an unrelated message", () => {
    expect(isClosedConnectionError(new Error("something else went wrong"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isClosedConnectionError("a string")).toBe(false);
    expect(isClosedConnectionError(null)).toBe(false);
    expect(isClosedConnectionError(undefined)).toBe(false);
    expect(isClosedConnectionError(42)).toBe(false);
  });
});

describe("retryOnClosedConnection", () => {
  it("returns the result when the operation succeeds on the first try", async () => {
    const operation = vi.fn().mockResolvedValue("ok");
    expect(await retryOnClosedConnection(operation)).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries and returns the result after a closed-connection error", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Server has closed the connection"))
      .mockResolvedValueOnce("recovered");
    expect(await retryOnClosedConnection(operation)).toBe("recovered");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("rethrows non-closed-connection errors immediately without retrying", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("syntax error"));
    await expect(retryOnClosedConnection(operation)).rejects.toThrow("syntax error");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("rethrows when the retry also fails with a closed-connection error", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("Connection terminated unexpectedly"));
    await expect(retryOnClosedConnection(operation)).rejects.toThrow(
      "Connection terminated unexpectedly",
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
