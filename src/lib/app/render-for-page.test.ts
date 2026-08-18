import { afterEach, describe, expect, it, vi } from "vitest";

import { renderForPage } from "@/lib/app/render-for-page";
import { AuthorizationError } from "@/lib/auth/authorization";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

const notFoundMock = mocks.notFound;

afterEach(() => notFoundMock.mockClear());

describe("renderForPage", () => {
  it("resolves the computed value when access is allowed", async () => {
    await expect(renderForPage(() => "ok")).resolves.toBe("ok");
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("renders a not-found page for forbidden page access", async () => {
    const error = new AuthorizationError(403, "FORBIDDEN", "Cross-company access is denied.");
    await expect(
      renderForPage(() => {
        throw error;
      })
    ).rejects.toMatchObject({ digest: "NEXT_NOT_FOUND" });
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("renders a not-found page when a resource is missing", async () => {
    const error = new AuthorizationError(404, "NOT_FOUND", "Request not found.");
    await expect(
      renderForPage(() => {
        throw error;
      })
    ).rejects.toMatchObject({ digest: "NEXT_NOT_FOUND" });
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("keeps company-required errors for the caller to debug", async () => {
    const error = new AuthorizationError(
      403,
      "COMPANY_REQUIRED",
      "A target company is required for resource access."
    );
    await expect(
      renderForPage(() => {
        throw error;
      })
    ).rejects.toBe(error);
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("rethrows unrelated errors", async () => {
    const error = new Error("boom");
    await expect(
      renderForPage(() => {
        throw error;
      })
    ).rejects.toBe(error);
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
