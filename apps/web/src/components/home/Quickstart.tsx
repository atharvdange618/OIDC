import { Section } from "@/components/neo/Section";
import { Tag } from "@/components/neo/Tag";
import { Button } from "@/components/neo/Button";
import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { CodeBlock } from "@/components/neo/CodeBlock";
import { MdOutlineContentCopy } from "react-icons/md";

export const Quickstart = () => {
  return (
    <Section
      id="quickstart"
      className="border-t-4 border-black dark:border-gray-700 bg-neutral-50 dark:bg-neutral-900/50"
    >
      <div className="flex items-end justify-between gap-6 flex-wrap mb-12">
        <div>
          <Tag tone="blue" className="mb-4">
            QUICKSTART GUIDE
          </Tag>
          <h2 className="text-4xl sm:text-5xl font-black font-sans">
            Up and running in minutes.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-serif max-w-2xl">
            Get Kleis running in your Next.js project by following these three
            essential steps.
          </p>
        </div>
        <a href="#quickstart" className="inline-flex">
          <Button
            size="md"
            variant="secondary"
            className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(74,144,204,0.3)] flex items-center gap-2"
          >
            <MdOutlineContentCopy size={18} />
            Copy snippets
          </Button>
        </a>
      </div>

      <div className="grid gap-12">
        <Card className="flex flex-col lg:flex-row items-stretch hover:translate-x-1 hover:translate-y-1 transition-transform overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col border-b-4 lg:border-b-0 lg:border-r-4 border-black dark:border-gray-700 lg:w-87.5 shrink-0 bg-white dark:bg-neutral-900">
            <CardHeader className="flex items-center gap-4 py-6 border-b-4 border-black dark:border-gray-700">
              <span className="flex items-center justify-center w-10 h-10 rounded-none border-2 border-black dark:border-gray-700 bg-[#FF9149] text-black font-black font-sans text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                1
              </span>
              <p className="font-black font-sans text-xl">Env variables</p>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-base text-muted-foreground font-serif leading-relaxed">
                Add these to your{" "}
                <code className="bg-muted px-2 py-0.5 font-mono text-sm border border-black/10 dark:border-white/10 rounded-sm">
                  .env.local
                </code>
                .
              </p>
            </CardContent>
          </div>
          <div className="flex-1 bg-[#FFECDB]/30 dark:bg-neutral-950 p-8 flex items-center min-w-0">
            <CodeBlock className="w-full shadow-none border-2 bg-[#FFECDB] dark:bg-neutral-900">
              <code>{`NEXT_PUBLIC_KLEIS_URL=https://auth.atharvdangedev.in
NEXT_PUBLIC_APP_URL=http://localhost:3000
KLEIS_CLIENT_ID=your_client_id
KLEIS_CLIENT_SECRET=your_client_secret
KLEIS_SECRET=your_session_encryption_secret`}</code>
            </CodeBlock>
          </div>
        </Card>

        <Card className="flex flex-col lg:flex-row items-stretch hover:translate-x-1 hover:translate-y-1 transition-transform overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col border-b-4 lg:border-b-0 lg:border-r-4 border-black dark:border-gray-700 lg:w-87.5 shrink-0 bg-white dark:bg-neutral-900">
            <CardHeader className="flex items-center gap-4 py-6 border-b-4 border-black dark:border-gray-700">
              <span className="flex items-center justify-center w-10 h-10 rounded-none border-2 border-black dark:border-gray-700 bg-[#60B5FF] text-black font-black font-sans text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                2
              </span>
              <p className="font-black font-sans text-xl">Route handler</p>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-base text-muted-foreground font-serif leading-relaxed">
                Handle the OIDC callback at{" "}
                <code className="bg-muted px-2 py-0.5 font-mono text-sm border border-black/10 dark:border-white/10 rounded-sm">
                  api/auth/[...kleis]/route.ts
                </code>
                .
              </p>
            </CardContent>
          </div>
          <div className="flex-1 bg-[#AFDDFF]/20 dark:bg-neutral-950 p-8 flex items-center min-w-0">
            <CodeBlock className="w-full shadow-none border-2 bg-[#AFDDFF]/30 dark:bg-neutral-900">
              <code>{`import { handleAuth } from "@kleis-auth/nextjs/server";

const handler = handleAuth({
  scopes: ["openid", "profile", "email"],
});

export { handler as GET, handler as POST };`}</code>
            </CodeBlock>
          </div>
        </Card>

        <Card className="flex flex-col lg:flex-row items-stretch hover:translate-x-1 hover:translate-y-1 transition-transform overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col border-b-4 lg:border-b-0 lg:border-r-4 border-black dark:border-gray-700 lg:w-87.5 shrink-0 bg-white dark:bg-neutral-900">
            <CardHeader className="flex items-center gap-4 py-6 border-b-4 border-black dark:border-gray-700">
              <span className="flex items-center justify-center w-10 h-10 rounded-none border-2 border-black dark:border-gray-700 bg-[#E0FFF1] text-black font-black font-sans text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                3
              </span>
              <p className="font-black font-sans text-xl">Middleware</p>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-base text-muted-foreground font-serif leading-relaxed">
                Protect your routes globally using{" "}
                <code className="bg-muted px-2 py-0.5 font-mono text-sm border border-black/10 dark:border-white/10 rounded-sm">
                  authMiddleware
                </code>
                .
              </p>
            </CardContent>
          </div>
          <div className="flex-1 bg-[#E0FFF1]/30 dark:bg-neutral-950 p-8 flex items-center min-w-0">
            <CodeBlock className="w-full shadow-none border-2 bg-[#E0FFF1]/50 dark:bg-neutral-900">
              <code>{`import { authMiddleware } from "@kleis-auth/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.*\\\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};`}</code>
            </CodeBlock>
          </div>
        </Card>
      </div>
    </Section>
  );
};
