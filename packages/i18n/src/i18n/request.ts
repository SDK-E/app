import { defaultLocale, type Locale, locales } from "@platform/i18n";
import { loadMessages, mergeMessages } from "@platform/i18n/messages";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const resolved: Locale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  const messages = await loadMessages(resolved);
  const fallback = resolved === defaultLocale ? messages : await loadMessages(defaultLocale);

  return {
    locale: resolved,
    messages: mergeMessages(fallback, messages),
  };
});
