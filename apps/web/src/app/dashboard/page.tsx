import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { Section } from "@/components/neo/Section";
import { Tag } from "@/components/neo/Tag";

export default function DeveloperDashboardPlaceholder() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="uppercase tracking-wide font-bold text-xs font-sans">
              Developer dashboard
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black font-sans">
              Coming soon
            </h1>
            <p className="mt-4 text-muted-foreground font-serif leading-relaxed">
              This route is reserved for the future Kleis developer experience:
              apps, client credentials, redirect URIs, and logs.
            </p>
          </div>
          <Tag tone="peach">placeholder</Tag>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: "Apps", body: "Create apps and manage redirect URIs." },
            { title: "Keys", body: "Rotate client secrets and view metadata." },
            {
              title: "Logs",
              body: "Inspect auth flows, errors, and sessions.",
            },
          ].map((c) => (
            <Card
              key={c.title}
              className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <CardHeader>
                <p className="font-black font-sans">{c.title}</p>
              </CardHeader>
              <CardContent>
                <p className="font-serif leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
