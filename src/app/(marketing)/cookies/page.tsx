import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import {
  LanguageLinks,
  LegalDivider,
  LegalH2,
  LegalIntro,
  LegalParagraph,
  LegalTitle,
} from "@/components/marketing/LegalText";

export const metadata: Metadata = {
  title: "Cookie policy — SDK Enterprises",
  description: "Cookie policy for the SDK Enterprises website.",
};

export default function CookiesPage() {
  return (
    <LegalPage>
      <LegalTitle>Cookie policy / Politique de cookies</LegalTitle>
      <LegalIntro>
        What cookies are and whether this site uses them. / Ce que sont les cookies et si
        ce site en utilise.
      </LegalIntro>
      <LanguageLinks />

      <section id="fr" aria-label="Politique de cookies en français">
        <LegalH2>Qu&apos;est-ce qu&apos;un cookie ?</LegalH2>
        <LegalParagraph>
          Un cookie est un petit fichier texte déposé sur votre appareil lors de la
          consultation d&apos;un site. Il permet au site de reconnaître votre navigateur et
          de mémoriser des informations.
        </LegalParagraph>

        <LegalH2>Cookies déposés sur ce site</LegalH2>
        <LegalParagraph>
          Aucun cookie de mesure d&apos;audience, de publicité ou de suivi n&apos;est déposé par ce
          site. La solution d&apos;analyse utilisée (Vercel Analytics) fonctionne sans cookie.
          Votre navigation ne fait donc l&apos;objet d&apos;aucun pistage.
        </LegalParagraph>

        <LegalH2>Bandeau de consentement</LegalH2>
        <LegalParagraph>
          Aucun bandeau de consentement n&apos;est affiché car aucun cookie n&apos;est déposé.
          Si un script déposant des cookies venait à être ajouté, un bandeau de
          consentement serait requis et cette page serait mise à jour.
        </LegalParagraph>

        <LegalH2>Gérer les cookies de votre navigateur</LegalH2>
        <LegalParagraph>
          Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies à
          tout moment. Les instructions dépendent de votre navigateur (Chrome, Firefox,
          Safari, Edge). Des guides sont disponibles sur www.cnil.fr.
        </LegalParagraph>
      </section>

      <LegalDivider />

      <section id="en" aria-label="Cookie policy in English">
        <LegalH2>What is a cookie?</LegalH2>
        <LegalParagraph>
          A cookie is a small text file placed on your device when you visit a website.
          It allows the site to recognise your browser and remember information.
        </LegalParagraph>

        <LegalH2>Cookies set by this site</LegalH2>
        <LegalParagraph>
          No analytics, advertising or tracking cookies are set by this site. The
          analytics solution in use (Vercel Analytics) is cookieless. Your browsing is
          therefore not tracked.
        </LegalParagraph>

        <LegalH2>Consent banner</LegalH2>
        <LegalParagraph>
          No consent banner is shown because no cookies are set. If a cookie-setting
          script were added, a consent banner would become required and this page would
          be updated.
        </LegalParagraph>

        <LegalH2>Managing cookies in your browser</LegalH2>
        <LegalParagraph>
          You can configure your browser to refuse or delete cookies at any time.
          Instructions depend on your browser (Chrome, Firefox, Safari, Edge). Guides are
          available at www.cnil.fr.
        </LegalParagraph>
      </section>

    </LegalPage>
  );
}
