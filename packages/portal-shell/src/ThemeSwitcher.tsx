"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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

  function select(next: Theme) {
    if (next === currentTheme) return;
    setTheme(next);
    updatePreferredThemeAction(next);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-control border p-1">
      {themes.map((value) => {
        const Icon = icons[value];
        const active = value === currentTheme;
        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            aria-pressed={active}
            aria-label={t(value)}
            title={t(value)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-control transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon
              className="h-4 w-4"
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
