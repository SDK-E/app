import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendInvitationNotification } from "@/lib/email/invitation";
import { sendMessage } from "@/lib/email/transport";

vi.mock("@/lib/email/transport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email/transport")>()),
  sendMessage: vi.fn(),
}));

const invitation = {
  email: "jo@acme.example",
  inviterName: "Alex",
  destination: "Acme Corp",
  role: "Project member",
  acceptUrl: "https://sdk.enterprises/invite/abc",
  expiresAt: new Date("2026-08-24T00:00:00.000Z"),
};

beforeEach(() => {
  vi.mocked(sendMessage).mockReset();
});

describe("sendInvitationNotification", () => {
  it("delivers the invite to the given address", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await expect(sendInvitationNotification(invitation)).resolves.toBe(true);

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      expect.objectContaining({
        from: `SDK Enterprises <no-reply@sdk.enterprises>`,
        to: "jo@acme.example",
        subject: "Invitation to Acme Corp",
      }),
      "invitation email"
    );
  });

  it("renders invite details and escapes untrusted text", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendInvitationNotification({
      ...invitation,
      inviterName: "A<lex>",
      destination: "Acme & Co",
      acceptUrl: 'https://example.test/?token="x"',
    });

    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("You have been invited to SDK Enterprises");
    expect(html).toContain("A&lt;lex&gt; invited you to Acme &amp; Co as Project member");
    expect(html).toContain("Review and accept the invitation");
    expect(html).toContain(`expires ${invitation.expiresAt.toISOString()}`);
  });
});
