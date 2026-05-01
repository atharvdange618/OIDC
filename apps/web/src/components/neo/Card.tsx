import * as React from "react";

import { cn } from "@/lib/cn";

export type CardProps = React.ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-none border-4 border-black dark:border-gray-700 bg-white dark:bg-neutral-900 " +
          "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]",
        className,
      )}
      {...props}
    />
  );
}

export type CardHeaderProps = React.ComponentPropsWithoutRef<"div">;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b-4 border-black dark:border-gray-700 p-6",
        className,
      )}
      {...props}
    />
  );
}

export type CardContentProps = React.ComponentPropsWithoutRef<"div">;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6", className)} {...props} />;
}
