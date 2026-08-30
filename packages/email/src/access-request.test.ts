import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendAccessRequestCreatedNotification,
  sendAccessRequestResolvedNotification,
} from "@sdk-e/email/access-request";
import { sendMessage } from "@sdk-e/email/transport";

vi.mock("@sdk-e/email/transport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@sdk-e/email/transport")>()),
  sendMessage: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(sendMessage).mockReset();
});

describe("sendAccessRequestCreatedNotification", () => {
  it("notifies the reviewer with the requester details", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await expect(
      sendAccessRequestCreatedNotification({
        to: "owner@acme.example",
        recipientName: "Olive",
        companyName: "Acme Corp",
        requesterName: "Jo",
        requesterEmail: "jo@acme.example",
      })
    ).resolves.toBe(true);

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "SDK Enterprises <no-reply@sdk.enterprises>",
        to: "owner@acme.example",
        subject: "Access request for Acme Corp",
      }),
      "access request email"
    );
    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("Access request for Acme Corp");
    expect(html).toContain("Jo (jo@acme.example) requested access to Acme Corp");
  });
});

describe("sendAccessRequestResolvedNotification", () => {
  it("announces an approved request with the granted role", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendAccessRequestResolvedNotification({
      to: "jo@acme.example",
      recipientName: "Jo",
      companyName: "Acme Corp",
      outcome: "APPROVED",
      role: "BILLING",
    });

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jo@acme.example",
        subject: "Access request approved for Acme Corp",
      }),
      "access request email"
    );
    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("<h2>Access request approved</h2>");
    expect(html).toContain("You now have BILLING access.");
  });

  it("falls back to viewer access when no role is provided", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendAccessRequestResolvedNotification({
      to: "jo@acme.example",
      recipientName: "Jo",
      companyName: "Acme Corp",
      outcome: "APPROVED",
    });

    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("You now have viewer access.");
  });

  it("announces a declined request", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendAccessRequestResolvedNotification({
      to: "jo@acme.example",
      recipientName: "Jo",
      companyName: "Acme Corp",
      outcome: "DECLINED",
    });

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Access request declined for Acme Corp",
      }),
      "access request email"
    );
    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("<h2>Access request declined</h2>");
    expect(html).toContain("was declined.");
  });
});
