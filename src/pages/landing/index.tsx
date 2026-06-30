import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { HowItWorks } from "./HowItWorks";
import { FeaturesSection } from "./FeaturesSection";
import { PartnersSection } from "./PartnersSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <FeaturesSection />
      <PartnersSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
