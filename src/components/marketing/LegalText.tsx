import type { ReactNode } from "react";

export function LegalTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h1 id={id} className="text-h1 tracking-h1">
      {children}
    </h1>
  );
}

export function LegalIntro({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-[70ch] text-body leading-[1.7] text-muted-foreground">
      {children}
    </p>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 text-label font-bold uppercase tracking-eyebrow text-dark">
      {children}
    </h2>
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

export function LanguageLinks() {
  return (
    <nav aria-label="Language" className="mt-8 flex items-center gap-3">
      <a
        href="#fr"
        className="text-label font-bold uppercase tracking-eyebrow text-dark transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
      >
        Lire en français
      </a>
      <span aria-hidden className="text-micro text-muted-foreground">
        /
      </span>
      <a
        href="#en"
        className="text-label font-bold uppercase tracking-eyebrow text-dark transition-opacity motion-reduce:transition-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
      >
        Read in English
      </a>
    </nav>
  );
}

export function PendingReviewNote() {
  return (
    <p className="mt-8 max-w-[70ch] rounded-nav border border-line bg-light px-4 py-3 text-micro uppercase tracking-eyebrow text-dark">
      Draft — legal text pending owner review / Brouillon — texte juridique en attente de
      validation par le propriétaire.
    </p>
  );
}
