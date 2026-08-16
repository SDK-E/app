import Link from "next/link";

export type ProblemNavigatorItem = {
  number: string;
  title: string;
  copy: string;
  href: string;
};

export function ProblemNavigator({
  heading,
  intro,
  items,
}: {
  heading: string;
  intro: string;
  items: ProblemNavigatorItem[];
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-[70px]">
      <div>
        <h2 className="max-w-[12ch] text-[36px] font-extrabold tracking-title md:text-title">
          {heading}
        </h2>
        <p className="mt-5 max-w-[44ch] text-body text-muted-foreground">{intro}</p>
      </div>
      <ol className="border-t-2 border-dark">
        {items.map((item) => (
          <li key={item.number} className="border-b border-line">
            <Link
              href={item.href}
              className="group grid gap-3 py-6 transition-opacity motion-reduce:transition-none hover:opacity-70 sm:grid-cols-[48px_0.75fr_1.25fr_24px] sm:items-start"
            >
              <span className="text-label font-bold text-muted-foreground">{item.number}</span>
              <span className="text-h3 font-extrabold">{item.title}</span>
              <span className="max-w-[48ch] text-body text-muted-foreground">{item.copy}</span>
              <span
                className="text-h3 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
