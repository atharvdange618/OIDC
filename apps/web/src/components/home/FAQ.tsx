import { Section } from "@/components/neo/Section";

export const FAQ = () => {
  const faqs = [
    {
      q: "Is Kleis production ready?",
      a: "Kleis is currently in v1.0.0-beta. It implements OIDC standards and uses industry-standard libraries like `jose`. We recommend it for small-to-medium projects while we stabilize.",
    },
    {
      q: "Why not just use NextAuth?",
      a: "NextAuth is great but can be heavy. Kleis is designed to be lightweight, edge-compatible, and focused purely on the OIDC + PKCE flow with HTTP-only cookies.",
    },
    {
      q: "Can I use my own UI for login?",
      a: "Yes! Kleis is an OIDC provider. You can build your own login and registration pages and simply point Kleis to them.",
    },
    {
      q: "What databases are supported?",
      a: "Kleis IdP uses Prisma by default, meaning you can use PostgreSQL, MySQL, SQLite, or MongoDB. The SDK is database agnostic.",
    },
  ];

  return (
    <Section className="border-t-4 border-black dark:border-gray-700">
      <div className="mb-16">
        <h2 className="text-4xl sm:text-5xl font-black font-sans">
          Common Questions
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="p-8 border-4 border-black dark:border-gray-700 bg-white dark:bg-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <p className="font-black font-sans text-lg mb-4">{faq.q}</p>
            <p className="font-serif text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
};
