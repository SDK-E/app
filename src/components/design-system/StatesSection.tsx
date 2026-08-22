import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatesSection() {
  return (
    <Section id="states">
      <SectionHeader
        eyebrow="04 · States"
        title="Loading, empty and error — consistent surfaces."
        intro="No color inventions. Skeleton uses the muted surface tone, empty states a dashed border, errors stay on the paper surface with strong dark emphasis."
      />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex min-h-48 flex-col gap-3 rounded-card border border-line bg-paper p-6">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
        <EmptyState
          title="No requests yet"
          description="When a project or request exists, it will appear here."
          action={<Button variant="dark">Request a service</Button>}
        />
        <ErrorState
          title="Something failed to load"
          description="Try again, or contact support if the problem persists."
          action={<Button variant="outline">Retry</Button>}
        />
      </div>
    </Section>
  );
}
