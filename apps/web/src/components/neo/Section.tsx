import * as React from "react";

import { cn } from "@/lib/cn";

export type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  containerClassName?: string;
};

export function Section({
  className,
  containerClassName,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-14 sm:py-20", className)} {...props}>
      <div className={cn("mx-auto max-w-6xl px-6", containerClassName)}>
        {props.children}
      </div>
    </section>
  );
}
