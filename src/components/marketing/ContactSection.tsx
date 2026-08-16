import { Section } from "@/components/layout/Section";
import { siteConfig } from "@/lib/siteConfig";
import { getTranslations } from "next-intl/server";

export default async function ContactSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <Section id="about" tone="brand">
      <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[70px]">
        <div>
          <p className="text-label font-bold uppercase tracking-eyebrow text-dark">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-[36px] font-extrabold tracking-title md:text-title">
            {t("heading")}
          </h2>
          <p className="mt-5 max-w-[65ch] text-body text-dark md:text-lead">{t("body")}</p>
        </div>
        <div className="rounded-card bg-dark p-6 text-light">
          <p className="text-body leading-relaxed text-fog">
            SDK Enterprises
            <br />
            {t("registeredUnder", { company: siteConfig.contact.company })}
            <br />
            {t("sirenSiret", { siren: siteConfig.contact.siren, siret: siteConfig.contact.siret })}
          </p>
          <div className="mt-4 divide-y divide-[#31512c]">
            {[
              siteConfig.contact.email,
              siteConfig.contact.phone,
              siteConfig.contact.address,
              siteConfig.contact.domain,
            ].map((line) => (
              <p key={line} className="py-3 text-label">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
