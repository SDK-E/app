import type { ReactNode } from "react";

export function LegalTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h1 id={id} className="text-h1 tracking-h1">
      {children}
    </h1>
  );
}

export function LegalIntro({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-[70ch] text-body leading-[1.7]">{children}</p>;
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 text-label font-bold uppercase tracking-eyebrow text-dark">{children}</h2>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-[70ch] text-body leading-[1.7] text-dark">{children}</p>;
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 max-w-[70ch] space-y-2 text-body leading-[1.7] text-dark">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden className="mt-[0.65em] h-px w-4 shrink-0 bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalDivider() {
  return <hr className="my-14 border-line" />;
}
