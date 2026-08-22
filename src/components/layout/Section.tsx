import type { CSSProperties, ReactNode } from "react";
import { Container } from "./Container";

export type SectionTone = "light" | "dark" | "brand";

/**
 * Single source of truth for surface theming.
 *
 * A surface (page section or inset island) declares its tone through the
 * --section-* custom properties; text inside either inherits the foreground
 * or opts into `text-section-muted` for secondary content. Both resolve with
 * ≥7:1 contrast against the surface in light and dark mode.
 *
 * Never pair these with `dark:` variants — the variables already invert.
 */
export const sectionToneStyles: Record<SectionTone, CSSProperties> = {
  light: {
    backgroundColor: "var(--section-light-bg)",
    color: "var(--section-light-fg)",
    "--section-muted": "var(--section-light-muted)",
  } as CSSProperties,
  dark: {
    backgroundColor: "var(--section-dark-bg)",
    color: "var(--section-dark-fg)",
    "--section-muted": "var(--section-dark-muted)",
  } as CSSProperties,
  brand: {
    backgroundColor: "var(--section-brand-bg)",
    color: "var(--section-brand-fg)",
    "--section-muted": "var(--section-brand-muted)",
  } as CSSProperties,
};

export function Section({
  id,
  tone = "light",
  borderTop = true,
  className = "",
  children,
}: {
  id?: string;
  tone?: SectionTone;
  borderTop?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={sectionToneStyles[tone]}
      className={`${borderTop ? "border-t border-line" : ""} py-12 md:py-14 lg:py-[84px] ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
