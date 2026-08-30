export type EngagementOption = {
  title: string;
  bestFor: string;
  output: string;
  commitment: string;
};

export function EngagementComparison({
  labels,
  options,
}: {
  labels: { bestFor: string; output: string; commitment: string };
  options: EngagementOption[];
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper text-dark">
      <div className="hidden grid-cols-[0.55fr_repeat(3,1fr)] border-b border-line bg-dark text-light lg:grid">
        <div className="p-5" />
        {options.map((option) => (
          <h3 key={option.title} className="border-l border-dark-deep p-5 text-h3">
            {option.title}
          </h3>
        ))}
      </div>
      {["bestFor", "output", "commitment"].map((field) => (
        <div
          key={field}
          className="grid border-b border-line last:border-b-0 lg:grid-cols-[0.55fr_repeat(3,1fr)]"
        >
          <p className="bg-light p-5 text-label font-bold uppercase tracking-eyebrow">
            {labels[field as keyof typeof labels]}
          </p>
          {options.map((option) => (
            <div
              key={option.title}
              className="border-t border-line p-5 first:border-t-0 lg:border-l lg:border-t-0"
            >
              <p className="mb-2 text-label font-bold uppercase tracking-eyebrow lg:hidden">
                {option.title}
              </p>
              <p className="text-body">{option[field as keyof Omit<EngagementOption, "title">]}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
