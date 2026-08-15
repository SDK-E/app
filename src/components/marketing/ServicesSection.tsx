import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";

const services = [
  {
    number: "01",
    category: "AI Engineering",
    title: "AI agents & automation",
    copy: "LLM integrations, agents, RAG, workflow automation, developer tooling and AI-assisted operations.",
  },
  {
    number: "02",
    category: "Backend",
    title: "Platforms, APIs & SaaS",
    copy: "PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs and realtime backend architecture.",
  },
  {
    number: "03",
    category: "Frontend",
    title: "Web & application interfaces",
    copy: "React, Vue, Nuxt, TypeScript, Tailwind and Shadcn.",
  },
  {
    number: "04",
    category: "Cloud",
    title: "Cloud & infrastructure",
    copy: "AWS, GCP, Azure, Kubernetes, Helm, CI/CD and deployment architecture.",
  },
  {
    number: "05",
    category: "Data",
    title: "Databases, cache & search",
    copy: "PostgreSQL, MySQL, MongoDB, Redis, Valkey and Elasticsearch.",
  },
  {
    number: "06",
    category: "Modernization",
    title: "Legacy modernization",
    copy: "Framework upgrades, migration, technical debt reduction and performance optimization.",
  },
];

export default function ServicesSection() {
  return (
    <Section id="services">
      <SectionHeader
        eyebrow="Services"
        title="Use all of the stack — or only the part you need."
        intro="SDK can engage on one specialized problem or own a broader technical workstream."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.title}
            className="flex min-h-[250px] flex-col justify-between"
          >
            <p className="text-micro font-bold uppercase tracking-label text-muted-foreground">
              {service.number} / {service.category.toUpperCase()}
            </p>
            <div>
              <h3 className="mt-8 text-h3">{service.title}</h3>
              <p className="mt-4 text-body text-muted-foreground">{service.copy}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
