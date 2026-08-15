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
