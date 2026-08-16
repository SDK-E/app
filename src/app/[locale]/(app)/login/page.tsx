import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; returnTo?: string; screen_hint?: string; email?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const returnTo = params.returnTo ?? params.callbackUrl;
  if (returnTo) query.set("returnTo", returnTo);
  if (params.screen_hint) query.set("screen_hint", params.screen_hint);
  if (params.email) query.set("login_hint", params.email);
  const qs = query.toString();
  redirect(qs ? `/auth/login?${qs}` : "/auth/login");
}
