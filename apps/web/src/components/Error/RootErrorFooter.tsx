import { Container } from "@platform/ui/Container";

export function RootErrorFooter() {
  return (
    <footer className="bg-dark py-6 text-micro text-fog">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span>© SDK Enterprises</span>
          <span>AI · Software · Cloud · Systems Engineering</span>
        </div>
      </Container>
    </footer>
  );
}
