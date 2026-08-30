import { Card } from "@platform/ui/Card";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";

const palette: { token: string; value: string; className: string }[] = [
  { token: "dark", value: "#082003", className: "bg-dark" },
  { token: "brand", value: "#2cdb16", className: "bg-brand" },
  { token: "light", value: "#d7e8d3", className: "bg-light border border-line" },
  { token: "paper", value: "#f8fbf7", className: "bg-paper border border-line" },
  { token: "dark-muted", value: "#354833", className: "bg-dark-muted" },
  { token: "fog", value: "#abc4a6", className: "bg-fog" },
  { token: "line", value: "#9db497", className: "bg-line" },
];

export function PaletteSection() {
  return (
    <Section id="colors">
      <SectionHeader
        eyebrow="01 · Palette"
        title="A small palette, used with intent."
        intro="Brand green is for actions and meaningful highlights only — never decoration. Green backgrounds always carry dark text; green text only appears on dark surfaces."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {palette.map((color) => (
          <Card
            key={color.token}
            className="flex min-h-40 flex-col justify-between gap-8"
          >
            <div className={`h-16 w-full rounded-control ${color.className}`} />
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow">{color.token}</p>
              <p className="mt-1 text-micro">{color.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
