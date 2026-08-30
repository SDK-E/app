import { localizePath } from "@platform/i18n";
import { Button } from "@platform/ui/Button";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

interface HeaderDesktopActionsProps {
  cta?: { label: string; href: string };
  resolvedSecondaryCta?: { label: string; href: string };
  locale?: string;
}

export function HeaderDesktopActions({
  cta,
  resolvedSecondaryCta,
  locale,
}: HeaderDesktopActionsProps) {
  return (
    <div className="hidden items-center gap-3 md:flex">
      {resolvedSecondaryCta ? (
        <Button
          href={localizedHref(locale, resolvedSecondaryCta.href)}
          variant="outline"
        >
          {resolvedSecondaryCta.label}
        </Button>
      ) : null}
      {cta ? (
        <Button
          href={localizedHref(locale, cta.href)}
          variant="dark"
        >
          {cta.label} →
        </Button>
      ) : null}
      <ThemeSwitcher />
      {locale && <LanguageSwitcher />}
    </div>
  );
}

function localizedHref(locale: string | undefined, href: string) {
  return locale ? localizePath(locale, href) : href;
}
