import type { ReactNode } from "react";
import { Container } from "./Container";

export type SectionTone = "light" | "dark" | "accent";

const toneClasses: Record<SectionTone, string> = {
  light: "bg-light text-dark",
  dark: "bg-dark text-light",
  accent: "bg-accent text-dark",
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
      className={`${toneClasses[tone]} ${
        borderTop ? "border-t border-line" : ""
      } py-12 md:py-14 lg:py-[84px] ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
