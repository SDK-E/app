import { AuthorizationError } from "@platform/auth/authorization";
import { IdentityError } from "@platform/auth/identity";
import { renderForPage } from "@platform/portal-shell/lib/render-for-page";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT" });
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const redirectMock = mocks.redirect;

afterEach(() => redirectMock.mockClear());

describe("renderForPage", () => {
  it("resolves the computed value when access is allowed", async () => {
    await expect(renderForPage(() => "ok", "en")).resolves.toBe("ok");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to unauthenticated for missing auth", async () => {
    const error = new AuthorizationError(401, "UNAUTHENTICATED", "Authentication is required.");
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/unauthenticated");
  });

  it("redirects to access-not-granted for forbidden page access", async () => {
    const error = new AuthorizationError(403, "FORBIDDEN", "Cross-company access is denied.");
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/app/error/access-not-granted");
  });

  it("redirects to access-not-granted for unassigned principals", async () => {
    const error = new AuthorizationError(
      403,
      "UNASSIGNED",
      "Application access has not been assigned.",
    );
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/app/error/access-not-granted");
  });

  it("redirects to access-not-granted for missing company scope", async () => {
    const error = new AuthorizationError(
      403,
      "COMPANY_REQUIRED",
      "A target company is required for resource access.",
    );
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/app/error/access-not-granted");
  });

  it("redirects to access-not-granted when a resource is missing", async () => {
    const error = new AuthorizationError(404, "NOT_FOUND", "Request not found.");
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/app/error/access-not-granted");
  });

  it("redirects to server-error for identity errors", async () => {
    const error = new IdentityError(
      "INVALID_IDENTITY",
      "The Auth0 identity is missing required claims.",
    );
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toMatchObject({ digest: "NEXT_REDIRECT" });
    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/en/app/error/server-error");
  });

  it("rethrows unrelated errors", async () => {
    const error = new Error("boom");
    await expect(
      renderForPage(() => {
        throw error;
      }, "en"),
    ).rejects.toBe(error);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
