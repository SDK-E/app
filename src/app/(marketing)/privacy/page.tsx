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
  title: "Privacy policy — SDK Enterprises",
  description: "Privacy policy (RGPD / GDPR) for the SDK Enterprises website.",
};

const PROCESSORS: Array<{ name: string; role: string }> = [
  { name: "Vercel", role: "Website hosting and cookieless analytics" },
  { name: "Auth0 (Okta)", role: "Authentication for the client portal" },
  { name: "Resend", role: "Transactional email for project enquiries" },
  { name: "Prisma Postgres", role: "Managed PostgreSQL database" },
];

export default function PrivacyPage() {
  const identity = siteConfig.contact;
  return (
    <LegalPage>
      <LegalTitle>Privacy policy / Politique de confidentialité</LegalTitle>
      <LegalIntro>
        How SDK Enterprises handles personal data, in accordance with the GDPR (RGPD).
        This page is bilingual. / Comment SDK Enterprises traite vos données personnelles,
        conformément au RGPD. Cette page est bilingue.
      </LegalIntro>
      <LanguageLinks />

      <section id="fr" aria-label="Politique de confidentialité en français">
        <LegalH2>Responsable de traitement</LegalH2>
        <LegalParagraph>
          Le responsable du traitement est la société <strong>{identity.company}</strong>,
          enseigne <strong>{siteConfig.name}</strong>, dont le siège est situé{" "}
          {identity.address}. Pour toute question relative à vos données personnelles,
          contactez-nous à {identity.email}.
        </LegalParagraph>

        <LegalH2>Données collectées</LegalH2>
        <LegalParagraph>
          Le seul formulaire de collecte du site est le formulaire public « Start a
          project » (démarrer un projet). Les données demandées sont strictement limitées
          à :
        </LegalParagraph>
        <LegalList
          items={[
            <>Nom de l&apos;entreprise (obligatoire)</>,
            <>Adresse e-mail professionnelle (obligatoire)</>,
            <>Site web de l&apos;entreprise (facultatif)</>,
            <>Compétence souhaitée (obligatoire)</>,
            <>Description du projet ou du problème (obligatoire)</>,
            <>Environnement existant (facultatif)</>,
            <>Calendrier (facultatif)</>,
            <>Fourchette budgétaire (facultatif)</>,
            <>Contexte complémentaire (facultatif)</>,
          ]}
        />

        <LegalH2>Finalités et bases légales</LegalH2>
        <LegalParagraph>Vos données sont traitées pour :</LegalParagraph>
        <LegalList
          items={[
            <>
              répondre à votre demande de projet — mesures précontractuelles (art.
              6.1.b du RGPD) et intérêt légitime (art. 6.1.f) ;
            </>,
            <>
              assurer le fonctionnement, la sécurité et l&apos;amélioration du site —
              intérêt légitime (art. 6.1.f) ;
            </>,
            <>
              satisfaire à d&apos;éventuelles obligations légales (art. 6.1.c).
            </>,
          ]}
        />

        <LegalH2>Destinataires des données</LegalH2>
        <LegalParagraph>
          Vos données sont accessibles uniquement aux personnes habilitées au sein de
          SDK Enterprises. Elles peuvent être traitées par les sous-traitants suivants,
          strictement pour les besoins de leurs services :
        </LegalParagraph>
        <LegalList
          items={PROCESSORS.map((processor) => (
            <span key={processor.name}>
              <strong>{processor.name}</strong> — {processor.role}
            </span>
          ))}
        />

        <LegalH2>Transferts hors Union européenne</LegalH2>
        <LegalParagraph>
          Certains sous-traitants peuvent traiter des données en dehors de l&apos;Espace
          économique européen (notamment aux États-Unis). Dans ce cas, des garanties
          appropriées sont mises en œuvre, telles que les clauses contractuelles types de
          la Commission européenne. <em>[Détails à confirmer par le propriétaire.]</em>
        </LegalParagraph>

        <LegalH2>Durée de conservation</LegalH2>
        <LegalParagraph>
          Les données issues du formulaire sont conservées pendant 12 mois à compter
          du dernier contact, sauf obligation légale contraire. Passé ce délai, elles
          sont supprimées ou anonymisées.
        </LegalParagraph>

        <LegalH2>Vos droits</LegalH2>
        <LegalParagraph>
          Conformément aux articles 15 à 22 du RGPD, vous disposez des droits d&apos;accès,
          de rectification, d&apos;effacement, de limitation, de portabilité et
          d&apos;opposition. Vous pouvez également retirer votre consentement à tout moment.
        </LegalParagraph>
        <LegalParagraph>
          Pour exercer ces droits, écrivez-nous à {identity.email}. Nous répondons dans
          un délai d&apos;un mois. Vous pouvez également introduire une réclamation auprès de
          la CNIL (www.cnil.fr).
        </LegalParagraph>

        <LegalH2>Enfants</LegalH2>
        <LegalParagraph>
          Le site s&apos;adresse à des professionnels et n&apos;est pas destiné aux mineurs. Le
          formulaire de demande n&apos;est pas destiné à des personnes de moins de 16 ans.
        </LegalParagraph>

        <LegalH2>Prise de décision automatisée</LegalH2>
        <LegalParagraph>
          Aucune décision automatisée, ni profilage, n&apos;est réalisé à partir de vos
          données.
        </LegalParagraph>

        <LegalH2>Sécurité</LegalH2>
        <LegalParagraph>
          Des mesures techniques et organisationnelles raisonnables sont mises en œuvre
          pour protéger vos données (connexions chiffrées, contrôles d&apos;accès). Aucune
          garantie absolue ne peut toutefois être offerte.
        </LegalParagraph>

        <LegalH2>Registre et déclaration</LegalH2>
        <LegalParagraph>
          SDK Enterprises tient un registre interne des activités de traitement (art. 30
          du RGPD). Aucun numéro de déclaration CNIL n&apos;est revendiqué ni inventé.
        </LegalParagraph>
      </section>

      <LegalDivider />

      <section id="en" aria-label="Privacy policy in English">
        <LegalH2>Data controller</LegalH2>
        <LegalParagraph>
          The data controller is <strong>{identity.company}</strong>, trading as{" "}
          <strong>{siteConfig.name}</strong>, registered office at {identity.address}.
          For any question about your personal data, contact us at {identity.email}.
        </LegalParagraph>

        <LegalH2>Data collected</LegalH2>
        <LegalParagraph>
          The only data-collection form on this site is the public “Start a project”
          form. The data requested is strictly limited to:
        </LegalParagraph>
        <LegalList
          items={[
            <>Company name (required)</>,
            <>Professional email address (required)</>,
            <>Company website (optional)</>,
            <>Capability needed (required)</>,
            <>Project or problem description (required)</>,
            <>Existing environment (optional)</>,
            <>Timeline (optional)</>,
            <>Budget range (optional)</>,
            <>Supporting context (optional)</>,
          ]}
        />

        <LegalH2>Purposes and legal bases</LegalH2>
        <LegalParagraph>Your data is processed to:</LegalParagraph>
        <LegalList
          items={[
            <>
              respond to your project enquiry — pre-contractual measures (Art. 6(1)(b)
              GDPR) and legitimate interest (Art. 6(1)(f));
            </>,
            <>
              operate, secure and improve the site — legitimate interest (Art. 6(1)(f));
            </>,
            <>comply with any applicable legal obligations (Art. 6(1)(c)).</>,
          ]}
        />

        <LegalH2>Recipients</LegalH2>
        <LegalParagraph>
          Your data is accessible only to authorised people within SDK Enterprises. It
          may be processed by the following processors, strictly for the needs of their
          services:
        </LegalParagraph>
        <LegalList
          items={PROCESSORS.map((processor) => (
            <span key={processor.name}>
              <strong>{processor.name}</strong> — {processor.role}
            </span>
          ))}
        />

        <LegalH2>Transfers outside the EU</LegalH2>
        <LegalParagraph>
          Some processors may process data outside the European Economic Area (notably in
          the United States). Where this occurs, appropriate safeguards are used, such as
          the European Commission&apos;s standard contractual clauses.{" "}
          <em>[Details to be confirmed by the owner.]</em>
        </LegalParagraph>

        <LegalH2>Retention</LegalH2>
        <LegalParagraph>
          Data collected through the form is kept for 12 months from the last contact,
          unless a longer retention is required by law. After this period, it is
          deleted or anonymised.
        </LegalParagraph>

        <LegalH2>Your rights</LegalH2>
        <LegalParagraph>
          In accordance with Articles 15 to 22 GDPR, you have the right to access,
          rectification, erasure, restriction, portability and objection. You may also
          withdraw your consent at any time.
        </LegalParagraph>
        <LegalParagraph>
          To exercise these rights, write to us at {identity.email}. We respond within
          one month. You may also lodge a complaint with the CNIL (www.cnil.fr).
        </LegalParagraph>

        <LegalH2>Children</LegalH2>
        <LegalParagraph>
          The site is aimed at professionals and is not intended for minors. The enquiry
          form is not intended for individuals under 16.
        </LegalParagraph>

        <LegalH2>Automated decision-making</LegalH2>
        <LegalParagraph>
          No automated decision-making or profiling is carried out on your data.
        </LegalParagraph>

        <LegalH2>Security</LegalH2>
        <LegalParagraph>
          Reasonable technical and organisational measures are in place to protect your
          data (encrypted connections, access controls). No absolute guarantee can be
          offered.
        </LegalParagraph>

        <LegalH2>Register and declaration</LegalH2>
        <LegalParagraph>
          SDK Enterprises maintains an internal register of processing activities (Art.
          30 GDPR). No CNIL declaration number is claimed or invented.
        </LegalParagraph>
      </section>

    </LegalPage>
  );
}
