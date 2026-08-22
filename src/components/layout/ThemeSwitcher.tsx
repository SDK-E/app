"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { updatePreferredThemeAction } from "@/app/[locale]/(app)/app/profile/actions";

const themes = ["light", "dark", "system"] as const;
type Theme = (typeof themes)[number];

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("theme");

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (mounted ? theme : "system") as Theme;

  function cycle() {
    const currentIndex = themes.indexOf(currentTheme);
    const next = themes[(currentIndex + 1) % themes.length];
    setTheme(next);
    updatePreferredThemeAction(next);
  }

  const Icon = icons[currentTheme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t(currentTheme)}
      title={t(currentTheme)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
