import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-xl text-lg text-foreground/80">
        {siteConfig.description}
      </p>
      <Link
        href="/login"
        className="rounded-md bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-80"
      >
        Sign in to your workspace
      </Link>
    </main>
  );
}
