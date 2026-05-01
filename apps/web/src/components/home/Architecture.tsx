import { Section } from "@/components/neo/Section";
import { Tag } from "@/components/neo/Tag";

export const Architecture = () => {
  const steps = [
    {
      step: "1",
      title: "User Initiates",
      desc: "User clicks login and redirected to Kleis IdP via PKCE.",
    },
    {
      step: "2",
      title: "Secure Callback",
      desc: "IdP validates and sends auth code back to your SDK handler.",
    },
    {
      step: "3",
      title: "Session Issued",
      desc: "SDK exchanges code for tokens and sets an HTTP-only cookie.",
    },
  ];
  return (
    <Section className="border-t-4 border-black dark:border-gray-700 bg-black text-white">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <Tag tone="blue" className="mb-6 bg-white text-black border-white">
            ARCHITECTURE
          </Tag>
          <h2 className="text-4xl sm:text-5xl font-black font-sans leading-tight">
            Built for the <br /> Next.js App Router.
          </h2>
          <p className="mt-6 text-lg font-serif text-gray-400 leading-relaxed">
            Kleis splits into two parts: A robust{" "}
            <strong>OIDC Identity Provider</strong> and a{" "}
            <strong>Next.js SDK</strong>. Your app stays lean while we handle
            the heavy lifting of security.
          </p>

          <div className="mt-10 space-y-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 bg-[#60B5FF] text-black font-black rounded-none">
                  {s.step}
                </div>
                <div>
                  <p className="font-black font-sans">{s.title}</p>
                  <p className="text-sm text-gray-400 font-serif">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative p-8 bg-neutral-900 border-4 border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-[#FF9149] bg-[#FF9149]/10 text-center">
              <p className="font-black text-xs mb-1">YOUR APP</p>
              <p className="text-[10px] text-gray-400 font-mono">
                Next.js + Kleis SDK
              </p>
            </div>
            <div className="p-4 border-2 border-[#60B5FF] bg-[#60B5FF]/10 text-center">
              <p className="font-black text-xs mb-1">KLEIS IDP</p>
              <p className="text-[10px] text-gray-400 font-mono">Auth Server</p>
            </div>
          </div>
          <div className="mt-8 p-4 border-2 border-dashed border-gray-700 text-center text-[10px] font-mono text-gray-500 italic">
            Secure PKCE Handshake Layer
          </div>
          <div className="mt-8 p-4 border-2 border-green-500 bg-green-500/10 text-center">
            <p className="font-black text-xs mb-1">SECURE SESSION</p>
            <p className="text-[10px] text-gray-400 font-mono">
              HTTP-only + AES-256
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};
