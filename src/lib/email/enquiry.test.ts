import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEnquiryNotification } from "@/lib/email/enquiry";
import { sendMessage } from "@/lib/email/transport";

vi.mock("@/lib/email/transport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email/transport")>()),
  sendMessage: vi.fn(),
}));

const baseEnquiry = {
  companyName: "Acme Corp",
  email: "owner@acme.example",
  capability: "ai-automation",
  description: "We want to automate our support queue end to end.",
};

beforeEach(() => {
  vi.mocked(sendMessage).mockReset();
});

describe("sendEnquiryNotification", () => {
  it("sends to the SDK contact with a normalized company subject", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await expect(
      sendEnquiryNotification({ ...baseEnquiry, companyName: "  Acme   Corp  " })
    ).resolves.toBe(true);

    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "hello@sdk.enterprises",
        subject: "New project enquiry — Acme Corp",
      }),
      "enquiry email"
    );
  });

  it("renders every provided field into the HTML body", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendEnquiryNotification({
      ...baseEnquiry,
      website: "https://acme.example",
      environment: "Legacy on-premise",
      timeline: "In the next quarter",
      budgetRange: "€20k–€30k",
      context: "Existing support team of five.",
    });

    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("<h2>New project enquiry</h2>");
    for (const label of [
      "Company",
      "Email",
      "Website",
      "Capability",
      "Description",
      "Existing environment",
      "Timeline",
      "Budget range",
      "Supporting context",
    ]) {
      expect(html).toContain(`<strong>${label}</strong>`);
    }
  });

  it("escapes HTML and turns newlines into breaks", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendEnquiryNotification({
      ...baseEnquiry,
      companyName: "<Acme> & Co",
      description: "Line one\nLine two <script>alert(1)</script>",
    });

    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).toContain("&lt;Acme&gt; &amp; Co");
    expect(html).toContain("Line one<br>Line two &lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("omits empty optional fields from the rendered rows", async () => {
    vi.mocked(sendMessage).mockResolvedValue(true);

    await sendEnquiryNotification({ ...baseEnquiry, website: null, timeline: null });

    const html = vi.mocked(sendMessage).mock.calls[0][0].html;
    expect(html).not.toContain("Website");
    expect(html).not.toContain("Timeline");
  });
});
