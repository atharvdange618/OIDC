import { Section } from "@/components/neo/Section";
import { Tag } from "@/components/neo/Tag";
import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { LuFileText } from "react-icons/lu";
import { FiZap } from "react-icons/fi";
import { FiDatabase } from "react-icons/fi";
import { LuHeartHandshake } from "react-icons/lu";
import { IoShieldHalfSharp } from "react-icons/io5";
import { LuLeaf } from "react-icons/lu";

export const Features = () => {
  const features = [
    {
      title: "Standards Compliant",
      body: "Full OpenID Connect (OIDC) support with Discovery and JWKS endpoints.",
      tone: "blue" as const,
      icon: <LuFileText className="text-blue-500" size={24} />,
    },
    {
      title: "Edge Ready",
      body: "Middleware and session logic built to run on the Edge without Node.js APIs.",
      tone: "mint" as const,
      icon: <FiZap className="text-green-500" size={24} />,
    },
    {
      title: "BYO Database",
      body: "Use Prisma, Mongoose, or raw SQL. Kleis doesn't care where you store users.",
      tone: "peach" as const,
      icon: <FiDatabase className="text-orange-500" size={24} />,
    },
    {
      title: "PKCE Handshake",
      body: "The most secure OAuth flow for single-page applications by default.",
      tone: "blue" as const,
      icon: <LuHeartHandshake className="text-blue-500" size={24} />,
    },
    {
      title: "Type Safe",
      body: "End-to-end TypeScript support for sessions, users, and configuration.",
      tone: "peach" as const,
      icon: <IoShieldHalfSharp className="text-orange-500" size={24} />,
    },
    {
      title: "Minimal Footprint",
      body: "Less than 10kb gzipped. No heavy client-side bundles or hidden costs.",
      tone: "mint" as const,
      icon: <LuLeaf className="text-green-500" size={24} />,
    },
  ];

  return (
    <Section className="border-t-4 border-black dark:border-gray-700">
      <div className="mb-16">
        <h2 className="text-4xl sm:text-5xl font-black font-sans">
          Everything you need.
        </h2>
        <p className="mt-4 text-xl text-muted-foreground font-serif max-w-2xl">
          A complete auth suite designed for the Next.js ecosystem.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="group hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            <CardHeader className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {f.icon}
                <p className="font-black font-sans">{f.title}</p>
              </div>
              <Tag tone={f.tone}>{f.tone.toUpperCase()}</Tag>
            </CardHeader>
            <CardContent>
              <p className="font-serif leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                {f.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};
