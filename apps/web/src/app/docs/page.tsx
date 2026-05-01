import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { CodeBlock } from "@/components/neo/CodeBlock";
import { Section } from "@/components/neo/Section";

export default function DocsPage() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="uppercase tracking-wide font-bold text-xs font-sans">
              Docs (v0)
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black font-sans">
              Getting started
            </h1>
            <p className="mt-4 text-muted-foreground font-serif leading-relaxed">
              This is a placeholder page. For now, the canonical docs live in
              the package README.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="font-black font-sans">Install</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock>
                <code>pnpm add @kleis-auth/nextjs</code>
              </CodeBlock>
              <a
                href="https://github.com/atharvdange618/OIDC/tree/main/packages/nextjs#readme"
                className="text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
              >
                Read the full README
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="font-black font-sans">Next steps</p>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-serif text-muted-foreground leading-relaxed">
                <li>Add the auth route handler (`app/api/auth/[...kleis]`).</li>
                <li>Add middleware protection (`middleware.ts`).</li>
                <li>Wrap `KleisProvider` in your root layout.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}
