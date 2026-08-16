export type ServiceChapterItem = {
  number: string;
  id: string;
  title: string;
  situation: string;
  investigation: string[];
  delivery: string[];
  evidence: string[];
  firstStep: string;
};

export function ServiceChapter({
  item,
  labels,
}: {
  item: ServiceChapterItem;
  labels: {
    investigation: string;
    delivery: string;
    evidence: string;
    firstStep: string;
  };
}) {
  return (
    <article
      id={item.id}
      className="scroll-mt-8 border-t-2 border-dark py-10 first:border-t-0 first:pt-0 lg:py-14"
    >
      <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-muted-foreground">
            {item.number}
          </p>
          <h3 className="mt-4 max-w-[16ch] text-[30px] font-extrabold tracking-title md:text-[38px]">
            {item.title}
          </h3>
          <p className="mt-5 max-w-[48ch] text-body text-muted-foreground">{item.situation}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-label font-bold uppercase tracking-eyebrow">
              {labels.investigation}
            </p>
            <ul className="mt-4 space-y-3">
              {item.investigation.map((line) => (
                <li key={line} className="flex gap-3 text-body text-muted-foreground">
                  <span className="font-bold text-dark" aria-hidden>
                    —
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-label font-bold uppercase tracking-eyebrow">{labels.delivery}</p>
            <ul className="mt-4 space-y-3">
              {item.delivery.map((line) => (
                <li key={line} className="flex gap-3 text-body text-muted-foreground">
                  <span className="font-bold text-dark" aria-hidden>
                    —
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2 grid gap-5 border-t border-line pt-6 sm:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-label font-bold uppercase tracking-eyebrow">{labels.evidence}</p>
              <p className="mt-3 text-body text-muted-foreground">{item.evidence.join(" · ")}</p>
            </div>
            <div className="rounded-card bg-dark p-5 text-light">
              <p className="text-micro font-bold uppercase tracking-eyebrow text-brand">
                {labels.firstStep}
              </p>
              <p className="mt-3 text-body text-fog">{item.firstStep}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
