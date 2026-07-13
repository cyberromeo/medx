import "./defi-landing.css";

import Hero from "@/components/defi-landing/Hero";
import Metrics from "@/components/defi-landing/Metrics";
import Features from "@/components/defi-landing/Features";
import CTA from "@/components/defi-landing/CTA";
import Footer from "@/components/defi-landing/Footer";

export default function Home() {
  return (
    <main className="defi-landing min-h-screen bg-[#f0f0f0]">
      <Hero />
      <Metrics />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
