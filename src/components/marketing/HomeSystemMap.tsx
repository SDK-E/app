export type HomeSystemMapItem = {
  number: string;
  title: string;
  copy: string;
  systems: string[];
};

export function HomeSystemMap({ items }: { items: HomeSystemMapItem[] }) {
  return (
    <ol className="overflow-hidden rounded-card border border-line bg-paper">
      {items.map((item, index) => (
        <li
          key={item.number}
          className={`grid gap-5 p-6 md:grid-cols-[64px_0.7fr_1.1fr_0.9fr] md:items-center md:p-7 ${
            index > 0 ? "border-t border-line" : ""
          }`}
        >
          <span className="text-label font-bold text-muted-foreground">{item.number}</span>
          <h3 className="max-w-[18ch] text-h3">{item.title}</h3>
          <p className="max-w-[54ch] text-body text-muted-foreground">{item.copy}</p>
          <p className="text-micro font-bold uppercase leading-relaxed tracking-eyebrow text-dark">
            {item.systems.join(" · ")}
          </p>
        </li>
      ))}
    </ol>
  );
}
