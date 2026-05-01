import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { Comparison } from "@/components/home/Comparison";
import { Features } from "@/components/home/Features";
import { Architecture } from "@/components/home/Architecture";
import { Quickstart } from "@/components/home/Quickstart";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <Navbar />
      <Hero />
      <Comparison />
      <Features />
      <Architecture />
      <Quickstart />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
