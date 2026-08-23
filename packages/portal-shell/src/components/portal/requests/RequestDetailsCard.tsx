import { Card } from "@sdk-e/ui/Card";
import type { RequestDetail, Translator } from "@sdk-e/requests/types";

export async function RequestDetailsCard({
  request,
  t,
}: {
  request: RequestDetail;
  t: Translator;
}) {
  return (
    <Card>
      <h2 className="text-h3 font-extrabold">{t("details")}</h2>
      <dl className="mt-5 space-y-4 text-body">
        <div>
          <dt className="font-semibold">{t("form.capability")}</dt>
          <dd>{t(`capabilities.${request.capability}`)}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("form.description")}</dt>
          <dd className="mt-1 whitespace-pre-wrap">{request.description}</dd>
        </div>
        {request.businessContext ? (
          <div>
            <dt className="font-semibold">{t("form.businessContext")}</dt>
            <dd className="mt-1 whitespace-pre-wrap">{request.businessContext}</dd>
          </div>
        ) : null}
        {request.supportingInformation ? (
          <div>
            <dt className="font-semibold">{t("form.supportingInformation")}</dt>
            <dd className="mt-1 whitespace-pre-wrap">{request.supportingInformation}</dd>
          </div>
        ) : null}
        {request.supportingLinks.length ? (
          <div>
            <dt className="font-semibold">{t("form.supportingLinks")}</dt>
            <dd className="mt-2 space-y-1">
              {request.supportingLinks.map((link) => (
                <a
                  key={link}
                  className="block break-all underline"
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link}
                </a>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
