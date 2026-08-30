import type { Locale } from "@platform/i18n";

interface MessageModule {
  default: Messages;
}
type Messages = Record<string, unknown>;

export const messageShardPaths = [
  "shared.json",
  "home.json",
  "enquiry.json",
  "portal.json",
  "pages/about.json",
  "pages/services.json",
  "pages/work.json",
  "pages/how-we-work.json",
  "legal/mentions-legales.json",
  "legal/privacy.json",
  "legal/terms.json",
  "legal/cookies.json",
] as const;

const messageShardLoaders: readonly ((locale: Locale) => Promise<MessageModule>)[] = [
  (locale) => import(`../locales/${locale}/shared.json`),
  (locale) => import(`../locales/${locale}/home.json`),
  (locale) => import(`../locales/${locale}/enquiry.json`),
  (locale) => import(`../locales/${locale}/portal.json`),
  (locale) => import(`../locales/${locale}/pages/about.json`),
  (locale) => import(`../locales/${locale}/pages/services.json`),
  (locale) => import(`../locales/${locale}/pages/work.json`),
  (locale) => import(`../locales/${locale}/pages/how-we-work.json`),
  (locale) => import(`../locales/${locale}/legal/mentions-legales.json`),
  (locale) => import(`../locales/${locale}/legal/privacy.json`),
  (locale) => import(`../locales/${locale}/legal/terms.json`),
  (locale) => import(`../locales/${locale}/legal/cookies.json`),
];

export async function loadMessages(locale: Locale): Promise<Messages> {
  const shards = await Promise.all(messageShardLoaders.map((loadShard) => loadShard(locale)));

  return shards.reduce((messages, shard) => mergeMessages(messages, shard.default), {});
}

export function mergeMessages(target: Messages, source: Messages): Messages {
  const result = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = result[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = mergeMessages(targetValue as Messages, sourceValue as Messages);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result;
}
