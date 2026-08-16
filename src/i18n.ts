export const locales = [
  "en",
  "fr",
  "de",
  "es",
  "pt",
  "it",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "pl",
  "cs",
  "hu",
  "ro",
  "bg",
  "el",
] as const;

export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export function localizePath(locale: string, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;

  const firstSegment = path.split("/")[1];
  if (locales.includes(firstSegment as Locale)) return path;

  return `/${locale}${path}`;
}
