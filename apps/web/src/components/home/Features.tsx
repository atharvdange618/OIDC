import { Section } from "@/components/neo/Section";
import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { LuFileText } from "react-icons/lu";
import { FiZap } from "react-icons/fi";
import { FiDatabase } from "react-icons/fi";
import { LuHeartHandshake } from "react-icons/lu";
import { IoShieldHalfSharp } from "react-icons/io5";
import { FaCode } from "react-icons/fa6";

export const Features = () => {
  const features = [
    {
      title: "Standards Compliant",
      body: "Full OpenID Connect (OIDC) support with Discovery and JWKS endpoints. Full SSO across all your apps.",
      icon: <LuFileText className="text-blue-500" size={24} />,
    },
    {
      title: "Edge Ready",
      body: "Middleware and session logic built to run on the Edge without Node.js APIs.",
      icon: <FiZap className="text-green-500" size={24} />,
    },
    {
      title: "BYO Database",
      body: "Use Prisma, Mongoose, or raw SQL. Kleis doesn't care where you store users.",
      icon: <FiDatabase className="text-orange-500" size={24} />,
    },
    {
      title: "PKCE Handshake",
      body: "The most secure OAuth flow for single-page applications by default.",
      icon: <LuHeartHandshake className="text-blue-500" size={24} />,
    },
    {
      title: "Type Safe",
      body: "End-to-end TypeScript support for sessions, users, and configuration.",
      icon: <IoShieldHalfSharp className="text-orange-500" size={24} />,
    },
    {
      title: "Language Agnostic",
      body: "Use the IdP manually via standard OIDC APIs with any language, framework, or HTTP client.",
      icon: <FaCode className="text-blue-500" size={24} />,
    },
  ];

  return (
    <Section className="border-t-4 border-black dark:border-neutral-700">
      <div className="mb-16 text-center lg:text-left">
        <h2 className="text-4xl sm:text-5xl font-semibold font-sans">
          Everything you need.
        </h2>
        <p className="mt-4 text-xl text-muted-foreground font-serif max-w-2xl mx-auto lg:mx-0">
          A complete auth suite designed for the Next.js ecosystem and beyond.
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
