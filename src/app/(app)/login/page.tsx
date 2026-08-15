import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; returnTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo ?? params.callbackUrl;
  redirect(returnTo ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}` : "/auth/login");
}
