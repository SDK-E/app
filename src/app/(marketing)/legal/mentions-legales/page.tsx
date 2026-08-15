import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LanguageLinks,
  LegalDivider,
  LegalH2,
  LegalIntro,
  LegalList,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Mentions légales — SDK Enterprises",
  description: "Legal notices (mentions légales) for the SDK Enterprises website.",
};

export default function MentionsLegalesPage() {
  const identity = siteConfig.contact;
  return (
    <LegalPage>
      <LegalTitle>Mentions légales</LegalTitle>
      <LegalIntro>
        This page is bilingual. / Cette page est bilingue.
      </LegalIntro>
      <LanguageLinks />

      <section id="fr" aria-label="Mentions légales en français">
        <LegalH2>Éditeur du site</LegalH2>
        <LegalParagraph>
          Le site internet accessible à l&apos;adresse {siteConfig.name.toLowerCase().replace(/\s+/g, ".")} est édité par la société <strong>{identity.company}</strong>, enseigne commerciale{" "}
          <strong>{siteConfig.name}</strong>.
        </LegalParagraph>
        <LegalList
          items={[
            <>SIREN : 850 513 912</>,
            <>SIRET : 850 513 912 00020</>,
            <>Siège social : {identity.address}</>,
            <>
              Forme juridique et capital social : Auto-entrepreneur (micro-entreprise), sans capital social
            </>,
            <>
              Immatriculation : RCS Paris 850 513 912
            </>,
          ]}
        />
        <LegalH2>Directeur de la publication</LegalH2>
        <LegalParagraph>
          Directeur de la publication : Hicham SADDEK.
        </LegalParagraph>
        <LegalH2>Hébergement</LegalH2>
        <LegalParagraph>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
          91723, États-Unis.
        </LegalParagraph>
        <LegalH2>Contact</LegalH2>
        <LegalParagraph>
          Toute question relative au site peut être adressée à {identity.email} ou par
          téléphone au {identity.phone}.
        </LegalParagraph>
        <LegalH2>Propriété intellectuelle</LegalH2>
        <LegalParagraph>
          La structure, les textes, le logo et les contenus du site sont la propriété de
          SDK Enterprises. Toute reproduction ou représentation, totale ou partielle,
          sans autorisation préalable est interdite, sauf dispositions légales
          applicables.
        </LegalParagraph>
        <LegalH2>Cadre juridique</LegalH2>
        <LegalParagraph>
          Les présentes mentions sont régies par le droit français. Elles sont établies
          conformément à l&apos;article 6-III de la loi n° 2004-575 du 21 juin 2004 pour
          la confiance dans l&apos;économie numérique (LCEN).
        </LegalParagraph>
      </section>

      <LegalDivider />

      <section id="en" aria-label="Mentions légales in English">
        <LegalH2>Publisher</LegalH2>
        <LegalParagraph>
          The website accessible at {siteConfig.name.toLowerCase().replace(/\s+/g, ".")} is published by <strong>{identity.company}</strong>, trading as{" "}
          <strong>{siteConfig.name}</strong>.
        </LegalParagraph>
        <LegalList
          items={[
            <>SIREN: 850 513 912</>,
            <>SIRET: 850 513 912 00020</>,
            <>Registered office: {identity.address}</>,
            <>
              Legal form and share capital: Auto-entrepreneur (sole trader, micro-entreprise), no share capital
            </>,
            <>
              Company registration: RCS Paris 850 513 912
            </>,
          ]}
        />
        <LegalH2>Publication director</LegalH2>
        <LegalParagraph>
          Publication director: Hicham SADDEK.
        </LegalParagraph>
        <LegalH2>Hosting</LegalH2>
        <LegalParagraph>
          The site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
          91723, United States.
        </LegalParagraph>
        <LegalH2>Contact</LegalH2>
        <LegalParagraph>
          Questions about the site may be sent to {identity.email} or by phone at{" "}
          {identity.phone}.
        </LegalParagraph>
        <LegalH2>Intellectual property</LegalH2>
        <LegalParagraph>
          The structure, texts, logo and content of the site are the property of SDK
          Enterprises. Any reproduction or representation, in whole or in part, without
          prior authorisation is prohibited, except as permitted by applicable law.
        </LegalParagraph>
        <LegalH2>Legal framework</LegalH2>
        <LegalParagraph>
          These notices are governed by French law and are established in accordance with
          Article 6-III of the French law n° 2004-575 of 21 June 2004 on confidence in
          the digital economy (LCEN).
        </LegalParagraph>
      </section>

    </LegalPage>
  );
}
