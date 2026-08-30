export interface ProcessTimelineItem {
  number: string;
  title: string;
  purpose: string;
  activities: string[];
  output: string;
  decision: string;
}

export function ProcessTimeline({
  items,
  labels,
}: {
  items: ProcessTimelineItem[];
  labels: { output: string; decision: string };
}) {
  return (
    <ol className="border-t-2 border-dark-deep">
      {items.map((item) => (
        <li
          key={item.number}
          className="grid gap-6 border-b border-dark-deep py-8 lg:grid-cols-[80px_0.6fr_1fr_0.85fr] lg:gap-8"
        >
          <p className="text-label font-bold text-section-accent">{item.number}</p>
          <div>
            <h3 className="text-h3">{item.title}</h3>
            <p className="mt-3 text-body text-section-muted">{item.purpose}</p>
          </div>
          <ul className="space-y-3">
            {item.activities.map((activity) => (
              <li
                key={activity}
                className="flex gap-3 text-body text-section-muted"
              >
                <span
                  className="text-section-accent"
                  aria-hidden
                >
                  —
                </span>
                {activity}
              </li>
            ))}
          </ul>
          <div className="rounded-card border border-dark-deep p-5">
            <p className="text-micro font-bold uppercase tracking-eyebrow text-section-accent">
              {labels.output}
            </p>
            <p className="mt-2 text-body text-section-muted">{item.output}</p>
            <p className="mt-5 text-micro font-bold uppercase tracking-eyebrow text-section-accent">
              {labels.decision}
            </p>
            <p className="mt-2 text-body text-section-muted">{item.decision}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
