import { getCurrentPrincipal } from "@platform/auth/identity";

import type { HeaderLink } from "./Header";

import { Header } from "./Header";

export async function PublicHeader({
  links,
  cta,
  secondaryCta,
  activeLabel,
  translationsNamespace,
  ariaHome,
  ariaMain,
  ariaToggleMenu,
  locale,
}: {
  links: HeaderLink[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  activeLabel?: string;
  translationsNamespace?: string;
  ariaHome?: string;
  ariaMain?: string;
  ariaToggleMenu?: string;
  locale?: string;
}) {
  const principal = await getCurrentPrincipal();

  return (
    <Header
      links={links}
      cta={cta}
      secondaryCta={secondaryCta}
      activeLabel={activeLabel}
      translationsNamespace={translationsNamespace}
      ariaHome={ariaHome}
      ariaMain={ariaMain}
      ariaToggleMenu={ariaToggleMenu}
      locale={locale}
      isAuthenticated={!!principal}
    />
  );
}
