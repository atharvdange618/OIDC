import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { Tag } from "@/components/neo/Tag";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to integrate Kleis Auth into your application using our Next.js SDK or manual OIDC integration.",
};

export default function DocsIntroduction() {
  return (
    <div className="space-y-12">
      <div>
        <Tag tone="blue" className="mb-4">
          WELCOME
        </Tag>
        <h1 className="text-4xl sm:text-6xl font-semibold font-sans leading-tight">
          Introduction
        </h1>
        <p className="mt-6 text-xl text-muted-foreground font-serif leading-relaxed max-w-3xl">
          Kleis is a modern, standards-compliant OpenID Connect (OIDC) suite.
          Whether you want a high-level SDK for Next.js or a standalone Auth
          Server for your multi-platform infrastructure, Kleis has you covered.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="flex flex-col h-full hover:translate-x-1 hover:translate-y-1 transition-transform">
          <CardHeader>
            <p className="font-black font-sans text-2xl">Next.js SDK</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-y-6">
            <p className="font-serif text-muted-foreground leading-relaxed">
              The fastest way to add auth to your Next.js application. Handles
              PKCE, sessions, and HTTP-only cookies out of the box.
            </p>
            <Link
              href="/docs/nextjs-sdk"
              className="inline-flex items-center gap-2 font-black font-sans text-black dark:text-white underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors group"
            >
              Get started with SDK{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform no-underline" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full hover:translate-x-1 hover:translate-y-1 transition-transform border-[#60B5FF]">
          <CardHeader className="bg-[#AFDDFF]/10">
            <p className="font-black font-sans text-2xl">Manual Integration</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-y-6">
            <p className="font-serif text-muted-foreground leading-relaxed">
              Use the Kleis Identity Provider (IdP) as a standalone OIDC server.
              Language agnostic and compatible with any standard OIDC library.
            </p>
            <Link
              href="/docs/idp-integration"
              className="inline-flex items-center gap-2 font-black font-sans text-black dark:text-white underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors group"
            >
              Manual API Guide{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform no-underline" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="p-8 border-4 border-black dark:border-neutral-700 bg-neutral-950 text-white">
        <h3 className="text-2xl font-semibold font-sans mb-4">
          Why choose Kleis?
        </h3>
        <ul className="grid gap-4 md:grid-cols-2 font-serif text-neutral-400">
          <li className="flex gap-2">
            <span className="text-primary font-black">✔</span> Full SSO Across
            All Your Apps
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-black">✔</span> Standards
            Compliant OIDC
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-black">✔</span> PKCE Secure by
            Default
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-black">✔</span> Lightweight &
            Edge Ready
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-black">✔</span> Open Source &
            Transparent
          </li>
        </ul>
      </div>
    </div>
  );
}
