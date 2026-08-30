import { Container } from "@platform/ui/Container";
import { useTranslations } from "next-intl";

export function ErrorFooter() {
  const tFooter = useTranslations("footer");
  return (
    <footer className="bg-dark py-6 text-micro text-fog">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span>{tFooter("copyright")}</span>
          <span>{tFooter("tagline")}</span>
        </div>
      </Container>
    </footer>
  );
}
