import { Section } from "@/components/neo/Section";
import { Button } from "@/components/neo/Button";
import { GoRocket } from "react-icons/go";
import { FaCode } from "react-icons/fa6";

export const CTA = () => {
  return (
    <Section className="border-t-4 border-black dark:border-gray-700 bg-[#60B5FF] dark:bg-primary text-black py-32">
      <div className="text-center">
        <h2 className="text-5xl sm:text-7xl font-black font-sans mb-8">
          Ready to ship?
        </h2>
        <p className="text-xl font-serif mb-12 max-w-2xl mx-auto opacity-80">
          Join developers building secure, lightweight applications with Kleis.
          Open source, standards compliant, and free to start.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a href="#quickstart">
            <Button
              size="lg"
              className="bg-black text-white border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              <GoRocket size={20} />
              Start Building Now
            </Button>
          </a>
          <a href="https://github.com/atharvdange618/OIDC">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-black border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
            >
              <FaCode size={20} />
              View Source Code
            </Button>
          </a>
        </div>
      </div>
    </Section>
  );
};
