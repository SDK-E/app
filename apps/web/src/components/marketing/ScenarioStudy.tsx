export type ScenarioStudyItem = {
  number: string;
  title: string;
  situation: string;
  signals: string[];
  questions: string[];
  deliverables: string[];
};

export function ScenarioStudy({
  item,
  labels,
}: {
  item: ScenarioStudyItem;
  labels: { signals: string; questions: string; deliverables: string };
}) {
  return (
    <article className="border-t-2 border-current py-10 first:border-t-0 first:pt-0 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-section-muted">
            {item.number}
          </p>
          <h3 className="mt-4 max-w-[18ch] text-[30px] font-extrabold tracking-title md:text-[38px]">
            {item.title}
          </h3>
          <p className="mt-5 max-w-[48ch] text-body text-section-muted">{item.situation}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: labels.signals, values: item.signals },
            { label: labels.questions, values: item.questions },
            { label: labels.deliverables, values: item.deliverables },
          ].map((group, index) => (
            <div
              key={group.label}
              className={`rounded-card border p-5 ${
                index === 2 ? "border-dark bg-dark text-light" : "border-line bg-paper text-dark"
              }`}
            >
              <p
                className={`text-micro font-bold uppercase tracking-eyebrow ${index === 2 ? "text-brand" : "text-dark"}`}
              >
                {group.label}
              </p>
              <ul className="mt-5 space-y-4">
                {group.values.map((value) => (
                  <li key={value} className={`text-body ${index === 2 ? "text-fog" : "text-dark"}`}>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
