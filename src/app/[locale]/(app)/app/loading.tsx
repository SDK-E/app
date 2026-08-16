import { Skeleton } from "@/components/ui/Skeleton";
import { getTranslations } from "next-intl/server";

export default async function AppLoading() {
  const t = await getTranslations("portal.states");
  return <div aria-label={t("loading")} className="space-y-6"><Skeleton className="h-12 max-w-2xl" /><Skeleton className="h-28 max-w-3xl" /><div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div></div>;
}
