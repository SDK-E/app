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
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Terms of use — SDK Enterprises",
  description: "Terms of use for the SDK Enterprises website.",
};

export default function TermsPage() {
  const identity = siteConfig.contact;
  return (
    <LegalPage>
      <LegalTitle>Terms of use / Conditions d&apos;utilisation</LegalTitle>
      <LegalIntro>
        The rules for using this website. / Les règles d&apos;utilisation de ce site.
      </LegalIntro>
      <LanguageLinks />

      <section id="fr" aria-label="Conditions d'utilisation en français">
        <LegalH2>Objet</LegalH2>
        <LegalParagraph>
          Les présentes conditions régissent l&apos;utilisation du site internet de{" "}
          {siteConfig.name}. En accédant au site, vous acceptez les présentes
          conditions.
        </LegalParagraph>

        <LegalH2>Présentation des services</LegalH2>
        <LegalParagraph>
          Le site présente les services de {siteConfig.name} et permet de soumettre une
          demande de projet. Ces contenus sont fournis à titre d&apos;information et ne
          constituent ni une offre contractuelle, ni un engagement à fournir des
          prestations.
        </LegalParagraph>

        <LegalH2>Demandes de projet</LegalH2>
        <LegalParagraph>
          Les informations transmises via le formulaire « Start a project » sont traitées
          conformément à la politique de confidentialité. La réception d&apos;une demande
          n&apos;implique aucune obligation d&apos;acceptation.
        </LegalParagraph>

        <LegalH2>Propriété intellectuelle</LegalH2>
        <LegalParagraph>
          Les textes, logo, visuels et contenus du site sont la propriété de SDK
          Enterprises et ne peuvent être réutilisés sans autorisation préalable.
        </LegalParagraph>

        <LegalH2>Disponibilité du site</LegalH2>
        <LegalParagraph>
          Le site est fourni « en l&apos;état ». SDK Enterprises s&apos;efforce d&apos;en assurer
          l&apos;accès, sans garantir une disponibilité ininterrompue ou sans erreur.
        </LegalParagraph>

        <LegalH2>Responsabilité</LegalH2>
        <LegalParagraph>
          Dans les limites prévues par la loi, la responsabilité de SDK Enterprises est
          limitée aux dommages directs et ne s&apos;étend pas aux dommages indirects. Les
          liens vers des sites tiers relèvent de la seule responsabilité de leurs
          éditeurs.
        </LegalParagraph>

        <LegalH2>Modifications</LegalH2>
        <LegalParagraph>
          SDK Enterprises peut modifier les présentes conditions à tout moment. La
          version applicable est celle publiée sur cette page.
        </LegalParagraph>

        <LegalH2>Droit applicable</LegalH2>
        <LegalParagraph>
          Les présentes conditions sont régies par le droit français. En cas de litige,
          les tribunaux français sont compétents.
          <em> [Clause à valider par le propriétaire ou un professionnel.]</em>
        </LegalParagraph>

        <LegalH2>Contact</LegalH2>
        <LegalParagraph>
          Pour toute question, contactez {identity.company} à {identity.email}.
        </LegalParagraph>
      </section>

      <LegalDivider />

      <section id="en" aria-label="Terms of use in English">
        <LegalH2>Purpose</LegalH2>
        <LegalParagraph>
          These terms govern your use of the {siteConfig.name} website. By accessing the
          site, you agree to these terms.
        </LegalParagraph>

        <LegalH2>Presentation of services</LegalH2>
        <LegalParagraph>
          The site presents the services of {siteConfig.name} and allows you to submit a
          project enquiry. This content is provided for information only and is neither a
          contractual offer nor a commitment to provide services.
        </LegalParagraph>

        <LegalH2>Project enquiries</LegalH2>
        <LegalParagraph>
          Information submitted through the “Start a project” form is handled in
          accordance with the privacy policy. Receiving an enquiry does not imply any
          obligation to accept it.
        </LegalParagraph>

        <LegalH2>Intellectual property</LegalH2>
        <LegalParagraph>
          The texts, logo, visuals and content of the site are the property of SDK
          Enterprises and may not be reused without prior authorisation.
        </LegalParagraph>

        <LegalH2>Site availability</LegalH2>
        <LegalParagraph>
          The site is provided “as is”. SDK Enterprises makes reasonable efforts to keep
          it accessible but does not guarantee uninterrupted or error-free availability.
        </LegalParagraph>

        <LegalH2>Liability</LegalH2>
        <LegalParagraph>
          To the extent permitted by law, SDK Enterprises&apos; liability is limited to
          direct damages and does not extend to indirect damages. Links to third-party
          sites are the sole responsibility of their publishers.
        </LegalParagraph>

        <LegalH2>Changes</LegalH2>
        <LegalParagraph>
          SDK Enterprises may amend these terms at any time. The applicable version is
          the one published on this page.
        </LegalParagraph>

        <LegalH2>Governing law</LegalH2>
        <LegalParagraph>
          These terms are governed by French law. In the event of a dispute, the French
          courts have jurisdiction.{" "}
          <em> [Clause to be validated by the owner or a professional.]</em>
        </LegalParagraph>

        <LegalH2>Contact</LegalH2>
        <LegalParagraph>
          For any question, contact {identity.company} at {identity.email}.
        </LegalParagraph>
      </section>

    </LegalPage>
  );
}
