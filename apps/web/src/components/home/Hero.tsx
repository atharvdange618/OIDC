import { Button } from "@/components/neo/Button";
import { Tag } from "@/components/neo/Tag";
import { Section } from "@/components/neo/Section";
import { CodeBlock } from "@/components/neo/CodeBlock";
import { FaGithub } from "react-icons/fa";

export const Hero = () => {
  return (
    <Section className="pt-12 sm:pt-24 pb-16 sm:pb-32 overflow-hidden relative">
      <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-[#60B5FF]/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <Tag tone="peach" className="mb-6 px-3 py-1.5 text-sm">
            SHIPPING V1.0.0
          </Tag>
          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] font-sans tracking-tight">
            Ship auth that feels{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-white dark:text-black">
                effortless.
              </span>
              <span className="absolute inset-0 bg-black dark:bg-white -rotate-1 -z-0 translate-y-2 translate-x-2" />
              <span className="absolute inset-0 bg-[#60B5FF] dark:bg-primary -rotate-1 -z-0" />
            </span>
          </h1>
          <p className="mt-8 text-xl font-serif leading-relaxed text-muted-foreground max-w-xl">
            Kleis is an OIDC provider and a Next.js SDK built for the modern
            web. PKCE, HTTP-only cookies, and Edge-ready middleware-without the
            bloat.
          </p>

          <div className="mt-10 flex flex-col sm:row gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#quickstart" className="inline-flex">
                <Button>Get Started Free</Button>
              </a>
              <a
                href="https://github.com/atharvdange618/OIDC"
                target="_blank"
                className="inline-flex"
              >
                <Button variant="secondary" className="flex items-center gap-2">
                  <FaGithub size={18} />
                  Star on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-[#FF9149]/20 -rotate-3 translate-x-4 translate-y-4 -z-10 border-4 border-black" />
          <CodeBlock title="Terminal">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-black" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
              <div className="w-3 h-3 rounded-full bg-green-400 border border-black" />
            </div>
            <code>$ pnpm add @kleis-auth/nextjs</code>
            <code className="block mt-2 text-foreground opacity-60">
              # Initializing session management...
            </code>
            <code className="block text-foreground opacity-60">
              # Setting up PKCE handshake...
            </code>
            <code className="block text-green-600 font-bold mt-2">
              ✔ Auth ready in 1.4s
            </code>
          </CodeBlock>
        </div>
      </div>
    </Section>
  );
};
