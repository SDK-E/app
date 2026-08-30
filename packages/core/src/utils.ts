import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: [
        "dark",
        "light",
        "paper",
        "muted",
        "fog",
        "line",
        "brand",
        "background",
        "foreground",
        "card",
        "card-foreground",
        "popover",
        "popover-foreground",
        "primary",
        "primary-foreground",
        "secondary",
        "secondary-foreground",
        "muted-foreground",
        "accent",
        "accent-foreground",
        "destructive",
        "destructive-foreground",
        "border",
        "ring",
        "input",
        "sidebar",
        "sidebar-foreground",
        "sidebar-primary",
        "sidebar-primary-foreground",
        "sidebar-accent",
        "sidebar-accent-foreground",
        "sidebar-border",
        "sidebar-ring",
        "chart-1",
        "chart-2",
        "chart-3",
        "chart-4",
        "chart-5",
      ],
    },
  },
  extend: {
    theme: {
      text: ["display", "title", "h1", "h3", "lead", "body", "label", "micro"],
      tracking: ["display", "title", "h1", "eyebrow", "label"],
      radius: ["card", "control", "nav"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function maskEmail(email: string): string {
  const [local, domain] = normalizeEmail(email).split("@");
  if (!domain) return email;
  const first = local.slice(0, 1);
  return `${first}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
