import { Card } from "@/components/ui/Card";
import type { RequestDetail, Translator } from "@/lib/requests/types";

export async function RequestHistoryCard({
  locale,
  request,
  t,
}: {
  locale: string;
  request: RequestDetail;
  t: Translator;
}) {
  return (
    <Card>
      <h2 className="text-h3 font-extrabold">{t("history")}</h2>
      <ol className="mt-5 space-y-4">
        {request.activities.map((item) => (
          <li key={item.id} className="border-l border-line pl-4 text-body">
            <p className="font-semibold">{item.type.replaceAll("_", " ").toLowerCase()}</p>
            <p className="text-muted-foreground">
              {item.actor.name} ·{" "}
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(item.createdAt)}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
