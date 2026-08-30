export type QualityFrameworkItem = {
  number: string;
  title: string;
  copy: string;
};

export function QualityFramework({ items }: { items: QualityFrameworkItem[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.number} className="rounded-card border border-line bg-paper p-6 text-dark">
          <div className="flex items-start justify-between gap-6">
            <h3 className="max-w-[18ch] text-h3">{item.title}</h3>
            <span className="text-label font-bold">{item.number}</span>
          </div>
          <p className="mt-6 max-w-[52ch] text-body">{item.copy}</p>
        </li>
      ))}
    </ol>
  );
}
