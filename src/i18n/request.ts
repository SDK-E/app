import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "../i18n";

function mergeMessages(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = mergeMessages(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        );
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
  }
  return result;
}

export default getRequestConfig(async ({ locale }) => {
  const resolved: string = locales.includes(locale as (typeof locales)[number])
    ? (locale as string)
    : defaultLocale;

  const messages = (await import(`../locales/${resolved}.json`)).default;
  const fallback = (await import(`../locales/${defaultLocale}.json`)).default;

  return {
    locale: resolved,
    messages: mergeMessages(fallback, messages),
  };
});
