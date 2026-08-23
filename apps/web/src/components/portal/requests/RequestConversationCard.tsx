import { Card } from "@sdk-e/ui/Card";
import type { RequestDetail, Translator } from "@sdk-e/requests/types";

export async function RequestConversationCard({
  request,
  t,
}: {
  request: RequestDetail;
  t: Translator;
}) {
  return (
    <Card>
      <h2 className="text-h3 font-extrabold">{t("conversation")}</h2>
      <div className="mt-5 space-y-4">
        {request.messages.map((item) => (
          <div key={item.id} className="border-t border-line pt-4">
            <p className="text-body font-semibold">{item.author.name}</p>
            <p className="mt-1 whitespace-pre-wrap text-body">{item.content}</p>
          </div>
        ))}
        {!request.messages.length ? <p className="text-body">{t("noMessages")}</p> : null}
      </div>
    </Card>
  );
}
