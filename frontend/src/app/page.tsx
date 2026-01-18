import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundGradients } from "@/components/ui/background-gradients";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";
import { LogoCloud } from "@/components/sections/LogoCloud";
import { Testimonials } from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <BackgroundGradients />
      <Navbar />
      
      <Hero />
      <LogoCloud />
      <Features />
      <Testimonials />
      <HowItWorks />
      <Pricing />
      <CTA />
      
      <Footer />
    </main>
  );
}
