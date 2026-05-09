import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { Comparison } from "@/components/home/Comparison";
import { Features } from "@/components/home/Features";
import { Architecture } from "@/components/home/Architecture";
import { Quickstart } from "@/components/home/Quickstart";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/home/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ship Auth Effortlessly",
  description:
    "The lightweight OIDC provider and Next.js SDK for modern applications. Secure by default with PKCE, HTTP-only cookies, and full SSO.",
};

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
