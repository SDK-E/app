import { Container } from "@/components/layout/Container";

export default function SiteFooter() {
  return (
    <footer className="bg-dark py-6 text-micro text-fog">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© SDK Enterprises</span>
          <span>AI · Software · Cloud · Systems Engineering</span>
        </div>
      </Container>
    </footer>
  );
}
