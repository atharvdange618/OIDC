import { Section } from "@/components/neo/Section";
import { Tag } from "@/components/neo/Tag";
import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { RxCross1 } from "react-icons/rx";
import { LuCircleAlert } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";

export const Comparison = () => {
  return (
    <Section
      id="why"
      className="border-t-4 border-black dark:border-gray-700 bg-[#FFECDB]/30 dark:bg-neutral-900/20"
    >
      <div className="mb-16 text-center lg:text-left">
        <Tag tone="blue" className="mb-4">
          THE PROBLEM
        </Tag>
        <h2 className="text-4xl sm:text-5xl font-black font-sans leading-tight">
          Stop fighting your auth <br className="hidden lg:block" />
          and start shipping features.
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-white dark:bg-neutral-900 border-red-500/50">
          <CardHeader className="bg-red-50 dark:bg-red-950/20">
            <p className="font-black font-sans text-xl flex items-center gap-3">
              <RxCross1 className="text-red-500" size={20} /> The Traditional
              Way
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 font-serif text-muted-foreground">
              <li className="flex gap-3">
                <LuCircleAlert className="shrink-0 text-red-500" size={18} />
                Complex OIDC configurations that take weeks to debug.
              </li>
              <li className="flex gap-3">
                <LuCircleAlert className="shrink-0 text-red-500" size={18} />
                Insecure localStorage patterns for session storage.
              </li>
              <li className="flex gap-3">
                <LuCircleAlert className="shrink-0 text-red-500" size={18} />
                Massive dependencies that bloat your bundle size.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-green-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <Tag tone="mint">RECOMMENDED</Tag>
          </div>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <p className="font-black font-sans text-xl flex items-center gap-3">
              <FaCheck className="text-green-500" size={20} /> The Kleis Way
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 font-serif text-muted-foreground">
              <li className="flex gap-3 text-foreground">
                <FaCheck className="shrink-0 text-green-500" size={18} />
                Zero-config setup with sane, secure defaults.
              </li>
              <li className="flex gap-3 text-foreground">
                <FaCheck className="shrink-0 text-green-500" size={18} />
                HTTP-only cookies for maximum security.
              </li>
              <li className="flex gap-3 text-foreground">
                <FaCheck className="shrink-0 text-green-500" size={18} />
                Lightweight: Only jose and zod under the hood.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
};
