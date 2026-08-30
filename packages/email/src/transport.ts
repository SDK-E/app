import { getServerEnv } from "@sdk-e/env";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMessage(
  message: { from: string; to: string; subject: string; html: string },
  label: string
): Promise<boolean> {
  if (getServerEnv().NODE_ENV !== "production") {
    const env = getServerEnv();
    const smtpUrl = env.MAIL_SMTP_URL ?? `smtp://localhost:${env.MAIL_SMTP_PORT ?? 1025}`;
    const { createTransport } = await import("nodemailer");
    const transport = createTransport(smtpUrl);
    try {
      await transport.sendMail(message);
      return true;
    } catch (error) {
      console.error(
        `${label}: local mail sink unreachable`,
        error instanceof Error ? error.message : "unknown error"
      );
      return false;
    } finally {
      transport.close();
    }
  }
  const apiKey = getServerEnv().RESEND_API_KEY;
  if (!apiKey) {
    console.error(`${label}: RESEND_API_KEY not set`);
    return false;
  }
  const { Resend } = await import("resend");
  const { data, error } = await new Resend(apiKey).emails.send(message);
  if (error) {
    console.error(`${label}: resend send failed`, error.name, error.message);
    return false;
  }
  console.log(`${label}: accepted by Resend`, data?.id);
  return true;
}
