import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#050816] text-white">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <CTASection />
      <Footer />
    </main>
  );
}