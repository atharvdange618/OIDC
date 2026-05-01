import * as React from "react";

import { cn } from "@/lib/cn";

export type TagProps = React.ComponentPropsWithoutRef<"span"> & {
  tone?: "blue" | "peach" | "mint";
};

const tones: Record<NonNullable<TagProps["tone"]>, string> = {
  blue: "bg-[#AFDDFF] dark:bg-gray-700 dark:text-white hover:bg-[#60B5FF]",
  peach: "bg-[#FFECDB] dark:bg-gray-800 dark:text-white",
  mint: "bg-[#E0FFF1] dark:bg-gray-800 dark:text-white",
};

export function Tag({ className, tone = "blue", ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border-2 border-black dark:border-gray-700 " +
          "px-2 py-1 text-xs font-bold font-sans " +
          "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
