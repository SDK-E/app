import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { escapeHtml, sendMessage } from "@/lib/email/transport";

const mocks = vi.hoisted(() => {
  const getServerEnv = vi.fn();
  const createTransport = vi.fn();
  const Resend = vi.fn();
  return { getServerEnv, createTransport, Resend };
});

vi.mock("@/lib/env", () => ({ getServerEnv: mocks.getServerEnv }));
vi.mock("nodemailer", () => ({ createTransport: mocks.createTransport }));
vi.mock("resend", () => ({ Resend: mocks.Resend }));

describe("escapeHtml", () => {
  it.each([
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&#39;"],
  ])("escapes %s into %s", (raw, escaped) => {
    expect(escapeHtml(raw)).toBe(escaped);
  });

  it("escapes every character in one pass", () => {
    expect(escapeHtml(`<a href="x&y">'z'</a>`)).toBe(
      "&lt;a href=&quot;x&amp;y&quot;&gt;&#39;z&#39;&lt;/a&gt;"
    );
  });
});

describe("sendMessage", () => {
  const message = {
    from: "from@test.example",
    to: "to@test.example",
    subject: "s",
    html: "<p>hi</p>",
  };
  let sendMail: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mocks.getServerEnv.mockReset();
    mocks.createTransport.mockReset();
    mocks.Resend.mockReset();
  });

  afterEach(() => {
    mocks.createTransport.mockReset();
    mocks.Resend.mockReset();
    mocks.getServerEnv.mockReset();
  });

  function stubNodemailer(failure?: Error) {
    sendMail = vi.fn().mockImplementation(async () => {
      if (failure) throw failure;
    });
    mocks.createTransport.mockReturnValue({ sendMail, close: vi.fn() });
  }

  it("delivers via the local mail sink in non-production environments", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "development", MAIL_SMTP_URL: undefined });
    stubNodemailer();

    await expect(sendMessage(message, "test email")).resolves.toBe(true);

    expect(mocks.createTransport).toHaveBeenCalledWith("smtp://localhost:1025");
    expect(sendMail).toHaveBeenCalledWith(message);
  });

  it("uses the configured SMTP URL when present", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "test", MAIL_SMTP_URL: "smtp://mail:2525" });
    stubNodemailer();

    await expect(sendMessage(message, "test email")).resolves.toBe(true);

    expect(mocks.createTransport).toHaveBeenCalledWith("smtp://mail:2525");
  });

  it("returns false and swallows sink failures in non-production", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "development", MAIL_SMTP_URL: undefined });
    stubNodemailer(new Error("sink down"));
    const errorSpy = vi.spyOn(console, "error");

    await expect(sendMessage(message, "test email")).resolves.toBe(false);

    expect(errorSpy).toHaveBeenCalledWith("test email: local mail sink unreachable", "sink down");
    errorSpy.mockRestore();
  });

  it("accepts a message through Resend in production", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "production", RESEND_API_KEY: "key-1" });
    const send = vi.fn().mockResolvedValue({ data: { id: "em_1" }, error: null });
    mocks.Resend.mockImplementation(function (this: { emails: unknown }) {
      this.emails = { send };
    });
    const logSpy = vi.spyOn(console, "log");

    await expect(sendMessage(message, "test email")).resolves.toBe(true);

    expect(mocks.Resend).toHaveBeenCalledWith("key-1");
    expect(send).toHaveBeenCalledWith(message);
    expect(logSpy).toHaveBeenCalledWith("test email: accepted by Resend", "em_1");
    logSpy.mockRestore();
  });

  it("returns false when Resend credentials are missing", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "production", RESEND_API_KEY: undefined });
    const errorSpy = vi.spyOn(console, "error");

    await expect(sendMessage(message, "test email")).resolves.toBe(false);

    expect(errorSpy).toHaveBeenCalledWith("test email: RESEND_API_KEY not set");
    errorSpy.mockRestore();
  });

  it("returns false and reports a Resend send error", async () => {
    mocks.getServerEnv.mockReturnValue({ NODE_ENV: "production", RESEND_API_KEY: "key-1" });
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: { name: "RateLimitError", message: "too fast" },
    });
    mocks.Resend.mockImplementation(function (this: { emails: unknown }) {
      this.emails = { send };
    });
    const errorSpy = vi.spyOn(console, "error");

    await expect(sendMessage(message, "test email")).resolves.toBe(false);

    expect(errorSpy).toHaveBeenCalledWith(
      "test email: resend send failed",
      "RateLimitError",
      "too fast"
    );
    errorSpy.mockRestore();
  });
});
