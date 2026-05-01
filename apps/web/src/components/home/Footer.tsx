import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="border-t-4 border-black dark:border-gray-700 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Logo />
            <p className="font-black font-sans text-lg">Kleis</p>
          </div>
          <p className="text-sm text-muted-foreground font-serif">
            OIDC provider + Next.js SDK. MIT licensed.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/atharvdange618/OIDC"
            target="_blank"
            className="text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@kleis-auth/nextjs"
            target="_blank"
            className="text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            npm
          </a>
          <a
            href="#quickstart"
            className="text-black dark:text-white font-bold underline decoration-4 decoration-[#60B5FF] hover:decoration-[#FF9149] transition-colors"
          >
            Quickstart
          </a>
        </div>
      </div>
    </footer>
  );
};
