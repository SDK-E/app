import { Header } from "@/components/layout/Header";
import ContactSection from "@/components/marketing/ContactSection";
import EngagementsSection from "@/components/marketing/EngagementsSection";
import Hero from "@/components/marketing/Hero";
import ProcessSection from "@/components/marketing/ProcessSection";
import ServicesSection from "@/components/marketing/ServicesSection";
import SiteFooter from "@/components/marketing/SiteFooter";
import WhySdkSection from "@/components/marketing/WhySdkSection";

export default function LandingPage() {
  return (
    <div className="bg-light text-dark">
      <Header
        links={[
          { label: "Services", href: "#services" },
          { label: "Work", href: "#work" },
          { label: "Process", href: "#process" },
          { label: "About", href: "#about" },
        ]}
        cta={{ label: "Discuss a project", href: "#about" }}
        secondaryCta={{ label: "Sign in", href: "/login" }}
      />
      <main>
        <Hero />
        <ServicesSection />
        <WhySdkSection />
        <EngagementsSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
