import * as React from "react";

import { cn } from "@/lib/cn";

export type CodeBlockProps = React.ComponentPropsWithoutRef<"pre"> & {
  title?: string;
};

export function CodeBlock({ className, title, ...props }: CodeBlockProps) {
  return (
    <div className="rounded-none border-4 border-black dark:border-gray-700 bg-[#FFECDB] dark:bg-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(74,144,204,0.25)]">
      {title ? (
        <div className="border-b-4 border-black dark:border-gray-700 px-4 py-3 font-bold font-sans text-sm">
          {title}
        </div>
      ) : null}
      <pre
        className={cn(
          "overflow-x-auto p-4 font-mono text-sm text-black dark:text-white",
          className,
        )}
        {...props}
      />
    </div>
  );
}
