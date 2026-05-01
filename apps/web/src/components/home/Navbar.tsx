import { Button } from "@/components/neo/Button";
import { Tag } from "@/components/neo/Tag";
import { Logo } from "./Logo";

export const Navbar = () => {
  return (
    <header className="border-b-4 border-black dark:border-gray-700 bg-white dark:bg-neutral-900 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-black font-sans text-xl">Kleis</span>
          <Tag tone="blue" className="hidden sm:inline-flex">
            OIDC + Next.js SDK
          </Tag>
        </div>

        <nav className="flex items-center gap-3">
          <a
            href="#why"
            className="hidden sm:inline-flex text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            Why Kleis?
          </a>
          <a
            href="#quickstart"
            className="hidden sm:inline-flex text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            Quickstart
          </a>
          <a
            href="https://github.com/atharvdange618/OIDC/tree/main/packages/nextjs#readme"
            className="hidden sm:inline-flex text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            Docs
          </a>
          <a href="#quickstart" className="inline-flex">
            <Button
              size="sm"
              className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,145,73,0.3)]"
            >
              Install
            </Button>
          </a>
        </nav>
      </div>
    </header>
  );
};
