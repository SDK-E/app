export function FitMatrix({
  fitTitle,
  notFitTitle,
  fitItems,
  notFitItems,
}: {
  fitTitle: string;
  notFitTitle: string;
  fitItems: string[];
  notFitItems: string[];
}) {
  return (
    <div className="grid overflow-hidden rounded-card border border-line bg-paper text-dark lg:grid-cols-2">
      {[
        { title: fitTitle, items: fitItems },
        { title: notFitTitle, items: notFitItems },
      ].map((group, index) => (
        <div
          key={group.title}
          className={`p-6 md:p-8 ${index === 1 ? "border-t border-line lg:border-l lg:border-t-0" : ""}`}
        >
          <h3 className="text-h3">{group.title}</h3>
          <ul className="mt-6 space-y-4">
            {group.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-body"
              >
                <span
                  className="font-bold text-dark"
                  aria-hidden
                >
                  {index === 0 ? "+" : "—"}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
